declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: 'dev' | 'qa' | 'prod';
      AWS_REGION: string;
      DATABASE_URL: string;
      S3_ASSETS_BUCKET_NAME: string;
      S3_CLIENT_BUCKET_NAME: string;
      COGNITO_CLIENT_ID: string;
      COGNITO_USER_POOL_ID: string;
      COGNITO_ISSUER: string;
    }
  }
}

export {};
