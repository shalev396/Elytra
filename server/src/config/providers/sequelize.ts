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
