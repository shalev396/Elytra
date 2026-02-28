import express from 'express';
import serverlessHttp from 'serverless-http';
import { responseFormatter, errorHandler, notFound } from '../../middlewares/index.js';
import { devRouter } from '../../routes/dev/index.js';
import { initDB } from '../../config/bootstrap.js';

await initDB();

const devApp = express();

devApp.use(express.json());
devApp.use(express.urlencoded({ extended: true }));

devApp.use(responseFormatter);

devApp.use('/api/dev', devRouter);

devApp.use(notFound);
devApp.use(errorHandler);

export const handler = serverlessHttp(devApp);
