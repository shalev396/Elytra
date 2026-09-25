import { Duration } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import type * as cognito from 'aws-cdk-lib/aws-cognito';
import type * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import type { StageConfig } from '../config.js';
import { resourceName } from '../naming.js';

export interface ApiRoutesProps {
  readonly handler: lambda.IFunction;
  readonly userPool: cognito.IUserPool;
  readonly userPoolClient: cognito.IUserPoolClient;
}

/**
 * HTTP API in front of the single function. Built in two steps: the API first (CloudFront needs
 * its id as an origin), routes later (they need the function, which needs Cognito, which waits
 * for CloudFront).
 */
export class Api extends Construct {
  readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, config: StageConfig) {
    super(scope, id);

    this.httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: resourceName(config.stage, 'api'),
      corsPreflight: {
        allowOrigins: [
          'http://localhost:5173',
          `https://${config.domainName}`,
          ...(config.wwwDomainName === undefined ? [] : [`https://${config.wwwDomainName}`]),
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
          apigwv2.CorsHttpMethod.HEAD,
        ],
        allowCredentials: true,
        maxAge: Duration.days(1),
      },
    });

    // Throttle on the auto-created $default stage (escape hatch: no second stage resource).
    const defaultStage = this.httpApi.defaultStage?.node.defaultChild;
    if (defaultStage instanceof apigwv2.CfnStage) {
      defaultStage.defaultRouteSettings = { throttlingRateLimit: 100, throttlingBurstLimit: 200 };
    }
  }

  addRoutes(props: ApiRoutesProps): void {
    const integration = new HttpLambdaIntegration('Integration', props.handler);
    const authorizer = new HttpUserPoolAuthorizer('CognitoAuthorizer', props.userPool, {
      userPoolClients: [props.userPoolClient],
    });
    const methods = [apigwv2.HttpMethod.ANY];

    this.httpApi.addRoutes({ path: '/api/public/{proxy+}', methods, integration });
    this.httpApi.addRoutes({ path: '/api/private/{proxy+}', methods, integration, authorizer });
    // Nothing else: stage maintenance (sync-db, reset-db) is a direct Lambda invoke, never HTTP.
  }
}
