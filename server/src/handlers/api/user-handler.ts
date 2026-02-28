import express from 'express';
import serverlessHttp from 'serverless-http';
import { responseFormatter, errorHandler, notFound, expressAuth } from '../../middlewares/index.js';
import { userRouter } from '../../routes/index.js';
import { initDB } from '../../config/bootstrap.js';

await initDB();

const userApp = express();

userApp.use(express.json());
userApp.use(express.urlencoded({ extended: true }));

userApp.use(responseFormatter);

userApp.use(expressAuth);

userApp.use('/api/user', userRouter);

userApp.use(notFound);
userApp.use(errorHandler);

export const handler = serverlessHttp(userApp);
