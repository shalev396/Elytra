import type { DatabaseProvider, Env } from '../types/env.d.ts';

/**
 * Runtime configuration. Only DOMAIN_NAME and DATABASE_URL are human inputs; everything else is
 * wired by the CDK stack (Lambda) or read from its outputs (local dev, see local.ts).
 */
class Environment {
  readonly #env: Env;
  readonly #awsRegion: string;
  readonly #databaseUrl: string;
  readonly #s3AssetsBucketName: string;
  readonly #cognitoClientId: string;
  readonly #cognitoUserPoolId: string;
  readonly #domainName: string;
  readonly #rateLimitEnabled: boolean;

  constructor() {
    this.#env = process.env.ENV;
    this.#awsRegion = process.env.AWS_REGION;
    this.#databaseUrl = process.env.DATABASE_URL;
    this.#s3AssetsBucketName = process.env.S3_ASSETS_BUCKET_NAME;
    this.#cognitoClientId = process.env.COGNITO_CLIENT_ID;
    this.#cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
    this.#domainName = process.env.DOMAIN_NAME;
    this.#rateLimitEnabled = process.env.DISABLE_RATE_LIMIT !== 'true';
  }

  get env(): Env {
    return this.#env;
  }

  get awsRegion(): string {
    return this.#awsRegion;
  }

  get databaseUrl(): string {
    return this.#databaseUrl;
  }

  /** Derived from the connection string scheme: mongodb:// or mongodb+srv:// → mongoose. */
  get databaseProvider(): DatabaseProvider {
    return /^mongodb(\+srv)?:\/\//i.test(this.#databaseUrl) ? 'mongoose' : 'sequelize';
  }

  get s3AssetsBucketName(): string {
    return this.#s3AssetsBucketName;
  }

  get cognitoClientId(): string {
    return this.#cognitoClientId;
  }

  get cognitoUserPoolId(): string | undefined {
    return this.#cognitoUserPoolId;
  }

  /** Derived from region + user pool id. */
  get cognitoIssuer(): string {
    return `https://cognito-idp.${this.#awsRegion}.amazonaws.com/${this.#cognitoUserPoolId}`;
  }

  get domainName(): string {
    return this.#domainName;
  }

  /** In-app rate limits. Only the local dev server turns them off (DISABLE_RATE_LIMIT, local.ts). */
  get rateLimitEnabled(): boolean {
    return this.#rateLimitEnabled;
  }

  /** Developer tools (/api/dev) exist on every stage except prod. */
  get enableDevTools(): boolean {
    return this.#env !== 'prod';
  }
}

export const environment = new Environment();
