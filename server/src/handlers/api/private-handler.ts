import express from 'express';
import serverlessHttp from 'serverless-http';
import {
  responseFormatter,
  errorHandler,
  notFound,
  expressAuth,
  generalLimiter,
} from '../../middlewares/index.js';
import { privateRouter } from '../../routes/index.js';
import { initDB } from '../../config/bootstrap.js';

await initDB();

const privateApp = express();

privateApp.use(express.json());
privateApp.use(express.urlencoded({ extended: true }));

privateApp.use(responseFormatter);
privateApp.use(generalLimiter);

privateApp.use(expressAuth);

privateApp.use('/api/private', privateRouter);

privateApp.use(notFound);
privateApp.use(errorHandler);

export const handler = serverlessHttp(privateApp, {
  binary: true,
});
