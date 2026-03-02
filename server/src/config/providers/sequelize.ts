import { Sequelize } from 'sequelize';
import pg from 'pg';
import { environment } from '../environment.js';

let sequelize: Sequelize | null = null;

export function getSequelize(): Sequelize {
  sequelize ??= new Sequelize(environment.databaseUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 60000,
      statement_timeout: 60000,
    },
    logging: false,
  });

  return sequelize;
}

export async function connectSequelize(): Promise<void> {
  const instance = getSequelize();
  await instance.authenticate();
}

export async function syncSequelize(): Promise<string[]> {
  await connectSequelize();

  await import('../../models/sequelize/User.js');
  await import('../../models/sequelize/Media.js');
  const { defineAssociations } = await import('../../models/sequelize/associations.js');
  defineAssociations();

  const instance = getSequelize();
  await instance.sync({ alter: true });

  return ['Sequelize: tables synced with { alter: true }'];
}

export async function clearAllSequelize(): Promise<void> {
  const instance = getSequelize();
  await instance.authenticate();
  await instance.drop();
}
