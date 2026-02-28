import express from 'express';
import serverlessHttp from 'serverless-http';
import { responseFormatter, errorHandler, notFound } from '../../middlewares/index.js';
import { authRouter } from '../../routes/index.js';
import { initDB } from '../../config/bootstrap.js';

await initDB();

const authApp = express();

authApp.use(express.json());
authApp.use(express.urlencoded({ extended: true }));

authApp.use(responseFormatter);

authApp.use('/api/auth', authRouter);

authApp.use(notFound);
authApp.use(errorHandler);

export const handler = serverlessHttp(authApp);
