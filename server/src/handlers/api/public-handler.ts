import express from 'express';
import serverlessHttp from 'serverless-http';
import { responseFormatter, errorHandler, notFound, authLimiter } from '../../middlewares/index.js';
import { publicRouter } from '../../routes/index.js';
import { initDB } from '../../config/bootstrap.js';

await initDB();

const publicApp = express();

publicApp.use(express.json());
publicApp.use(express.urlencoded({ extended: true }));

publicApp.use(responseFormatter);
publicApp.use(authLimiter);

publicApp.use('/api/public', publicRouter);

publicApp.use(notFound);
publicApp.use(errorHandler);

export const handler = serverlessHttp(publicApp);
