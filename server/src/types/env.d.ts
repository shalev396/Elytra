export type Env = 'dev' | 'qa' | 'prod';
export type DatabaseProvider = 'sequelize' | 'mongoose';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: Env;
      AWS_REGION: string;
      DATABASE_URL: string;
      S3_ASSETS_BUCKET_NAME: string;
      COGNITO_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      DOMAIN_NAME: string;
      /** 'true' turns off in-app rate limits. Set only by the local dev server; never on Lambda. */
      DISABLE_RATE_LIMIT?: 'true';
    }
  }
}

export {};
