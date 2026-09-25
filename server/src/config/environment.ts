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

  /**
   * Derived from the connection string scheme: mongodb:// or mongodb+srv:// → Mongoose,
   * postgres:// or postgresql:// → Sequelize (PostgreSQL, the only dialect and driver bundled).
   * Anything else fails here with a clear message instead of later as a PostgreSQL connection
   * error.
   */
  get databaseProvider(): DatabaseProvider {
    if (/^mongodb(\+srv)?:\/\//i.test(this.#databaseUrl)) return 'mongoose';
    if (/^postgres(ql)?:\/\//i.test(this.#databaseUrl)) return 'sequelize';
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(this.#databaseUrl)?.[1] ?? '(none)';
    throw new Error(
      `Unsupported DATABASE_URL scheme "${scheme}": use mongodb://, mongodb+srv://, postgres:// or postgresql://`,
    );
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

  /** The destructive reset-db action is allowed on every stage except prod. */
  get allowsStageReset(): boolean {
    return this.#env !== 'prod';
  }
}

export const environment = new Environment();
