import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import newman from 'newman';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env.qa');
dotenv.config({ path: envPath });

const domainName = process.env.DOMAIN_NAME;
if (!domainName) {
  throw new Error('DOMAIN_NAME environment variable is required');
}

const baseUrl = `https://${domainName}/api`;

interface CollectionResult {
  collection: string;
  passed: boolean;
  failures: number;
}

function parseArgs(): string {
  const args = process.argv.slice(2);

  const collectionEqualArg = args.find((arg) => arg.startsWith('--collection='));
  if (collectionEqualArg !== undefined) {
    const value = collectionEqualArg.split('=')[1];
    if (value !== undefined && value !== '') return value;
  }

  const collectionIndex = args.indexOf('--collection');
  if (collectionIndex !== -1) {
    const value = args[collectionIndex + 1];
    if (value !== undefined && value !== '') return value;
  }

  return 'all';
}

async function setup(): Promise<void> {
  console.log('\n========================================');
  console.log('       TEST SETUP');
  console.log('========================================\n');
  console.log(`API Base URL: ${baseUrl}\n`);

  console.log('[Setup] Clearing database...');
  const databaseModule = (await import('../src/config/database.js')) as {
    clearDB: () => Promise<void>;
  };
  await databaseModule.clearDB();

  console.log('[Setup] Clearing Cognito users...');
  const cognitoModule = (await import('./helpers/cognito.js')) as {
    clearAllCognitoUsers: () => Promise<void>;
  };
  await cognitoModule.clearAllCognitoUsers();

  console.log('[Setup] Setup complete!\n');
}

interface NewmanEnvironment {
  values: { key: string; value: string }[];
}

function runCollection(
  collectionName: string,
  envVars: { key: string; value: string }[],
): Promise<{ result: CollectionResult; exportedEnv: NewmanEnvironment }> {
  return new Promise((resolve, reject) => {
    const collectionPath = path.join(
      __dirname,
      'collections',
      `${collectionName}.postman_collection.json`,
    );
    const environmentPath = path.join(__dirname, 'environments', 'qa.postman_environment.json');
    const exportPath = path.join(__dirname, 'environments', 'exported.postman_environment.json');

    console.log(`\n========================================`);
    console.log(`       RUNNING: ${collectionName.toUpperCase()} COLLECTION`);
    console.log(`========================================\n`);

    newman.run(
      {
        collection: collectionPath,
        environment: environmentPath,
        envVar: [{ key: 'baseUrl', value: baseUrl }, ...envVars],
        exportEnvironment: exportPath,
        reporters: ['cli'],
        color: 'on',
        delayRequest: 10000,
      },
      (err, summary) => {
        if (err) {
          reject(err);
          return;
        }

        const failures = summary.run.failures.length;
        const exportedEnv = summary.environment.toJSON() as NewmanEnvironment;

        if (failures > 0) {
          console.log(`\n[${collectionName}] ${String(failures)} test(s) failed`);
          resolve({
            result: { collection: collectionName, passed: false, failures },
            exportedEnv,
          });
        } else {
          console.log(`\n[${collectionName}] All tests passed!`);
          resolve({
            result: { collection: collectionName, passed: true, failures: 0 },
            exportedEnv,
          });
        }
      },
    );
  });
}

function getEnvVar(env: NewmanEnvironment, key: string): string {
  const found = env.values.find((v) => v.key === key);
  return found?.value ?? '';
}

async function run(): Promise<void> {
  const collection = parseArgs();
  const results: CollectionResult[] = [];

  try {
    await setup();

    if (collection === 'all') {
      const { result: authResult, exportedEnv } = await runCollection('auth', []);
      results.push(authResult);

      const idToken = getEnvVar(exportedEnv, 'idToken');
      const refreshToken = getEnvVar(exportedEnv, 'refreshToken');
      const testEmail = getEnvVar(exportedEnv, 'testEmail');
      const testPassword = getEnvVar(exportedEnv, 'testPassword');

      const { result: userResult } = await runCollection('user', [
        { key: 'idToken', value: idToken },
        { key: 'refreshToken', value: refreshToken },
        { key: 'testEmail', value: testEmail },
        { key: 'testPassword', value: testPassword },
      ]);
      results.push(userResult);
    } else {
      const { result } = await runCollection(collection, []);
      results.push(result);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n[Error]', message);
    process.exitCode = 1;
  }

  console.log('\n========================================');
  console.log('       RESULTS SUMMARY');
  console.log('========================================\n');

  let totalFailures = 0;
  for (const result of results) {
    const status = result.passed ? 'PASSED' : 'FAILED';
    console.log(`${result.collection}: ${status} (${String(result.failures)} failures)`);
    totalFailures += result.failures;
  }

  if (totalFailures > 0) {
    process.exitCode = 1;
  }

  console.log('\n');
}

void run();
