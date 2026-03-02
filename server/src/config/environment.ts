type DatabaseProvider = 'sequelize' | 'mongoose';
type Env = 'dev' | 'qa' | 'prod';

class Environment {
  readonly #env: Env;
  readonly #awsRegion: string;
  readonly #databaseUrl: string;
  readonly #databaseProvider: DatabaseProvider;
  readonly #s3AssetsBucketName: string;
  readonly #s3ClientBucketName: string;
  readonly #cognitoClientId: string;
  readonly #cognitoUserPoolId: string;
  readonly #cognitoIssuer: string;
  readonly #domainName: string;

  constructor() {
    this.#env = process.env.ENV;
    this.#awsRegion = process.env.AWS_REGION;
    this.#databaseUrl = process.env.DATABASE_URL;
    this.#databaseProvider = process.env.DATABASE_PROVIDER;
    this.#s3AssetsBucketName = process.env.S3_ASSETS_BUCKET_NAME;
    this.#s3ClientBucketName = process.env.S3_CLIENT_BUCKET_NAME;
    this.#cognitoClientId = process.env.COGNITO_CLIENT_ID;
    this.#cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
    this.#cognitoIssuer = process.env.COGNITO_ISSUER;
    this.#domainName = process.env.DOMAIN_NAME;
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

  get databaseProvider(): DatabaseProvider {
    return this.#databaseProvider;
  }

  get s3AssetsBucketName(): string {
    return this.#s3AssetsBucketName;
  }

  get s3ClientBucketName(): string {
    return this.#s3ClientBucketName;
  }

  get cognitoClientId(): string {
    return this.#cognitoClientId;
  }

  get cognitoUserPoolId(): string | undefined {
    return this.#cognitoUserPoolId;
  }

  get cognitoIssuer(): string {
    return this.#cognitoIssuer;
  }

  get domainName(): string {
    return this.#domainName;
  }
}

export const environment = new Environment();
