import type { Handler } from 'aws-lambda';
import { initDB, syncDB } from '../../config/bootstrap.js';
import { disconnectDB } from '../../config/database.js';

export const handler: Handler = async () => {
  try {
    await initDB();
    const results = await syncDB();
    await disconnectDB();
    return { statusCode: 200, body: JSON.stringify({ results }) };
  } catch (error) {
    console.error('sync-db failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    await disconnectDB();
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
};
