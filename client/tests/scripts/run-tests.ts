/// <reference types="node" />
/**
 * Cross-platform E2E test runner.
 * Works on Windows, macOS, and Linux.
 *
 * Usage:
 *   npx tsx tests/scripts/run-tests.ts install   - Create venv, install deps, playwright
 *   npx tsx tests/scripts/run-tests.ts run       - Run pytest (local)
 *   npx tsx tests/scripts/run-tests.ts run --headed - Run with visible browser (non-headless)
 *   npx tsx tests/scripts/run-tests.ts run --qa  - Run pytest against QA URLs
 *
 * Tests run in parallel on E2E_WORKERS pytest-xdist workers (default: one per CPU, at most 4;
 * 0 = one process). Each worker drives its own Chromium, so more workers than CPUs starves them.
 * --dist loadgroup keeps the tests conftest.py marks as shared-state on a single worker.
 *
 * --qa also loads server/.env.qa (shell and CI variables win), derives BASE_URL and API_BASE_URL
 * from DOMAIN_NAME when they are unset, and requires BASIC_AUTH_PASSWORD for the WAF gate on the
 * qa pages. Local runs never need the password.
 *
 * The suite does not reset the stage; to start from an empty dev/qa stage, run
 * `npm run reset:db -- <stage>` in server/ first (CI does). See tests/README.md.
 */
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const isWin = process.platform === 'win32';
const VENV_BIN = path.join(ROOT, '.venv', isWin ? 'Scripts' : 'bin');
const PYTHON = path.join(VENV_BIN, isWin ? 'python.exe' : 'python');
const PIP = path.join(VENV_BIN, isWin ? 'pip.exe' : 'pip');

function run(cmd: string, args: string[], opts?: { cwd?: string; env?: NodeJS.ProcessEnv }) {
  const cwd = opts?.cwd ?? ROOT;
  const env = { ...process.env, ...opts?.env };
  const result = spawnSync(cmd, args, { cwd, env, stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolvePython(): string {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    return 'python3';
  } catch {
    return 'python';
  }
}

function cmdInstall(): void {
  const py = resolvePython();
  const venvPath = path.join(ROOT, '.venv');

  if (!fs.existsSync(venvPath)) {
    console.log('Creating .venv...');
    run(py, ['-m', 'venv', venvPath]);
  }

  console.log('Installing test dependencies...');
  run(PIP, ['install', '-r', 'requirements-test.txt']);

  console.log('Installing Playwright Chromium...');
  run(path.join(VENV_BIN, isWin ? 'playwright.cmd' : 'playwright'), [
    'install',
    '--with-deps',
    'chromium',
  ]);
}

function cmdRun(): void {
  const qa = process.argv.includes('--qa');
  const headed = process.argv.includes('--headed');

  let baseUrl: string;
  let apiBaseUrl: string;
  let basicAuthPassword = '';

  if (qa) {
    const envFile = path.join(ROOT, '..', 'server', '.env.qa');
    if (fs.existsSync(envFile)) {
      process.loadEnvFile(envFile); // never overrides variables already set (CI wins)
    }

    const domain = process.env['DOMAIN_NAME']?.trim() ?? '';
    baseUrl = process.env['BASE_URL'] ?? (domain ? `https://${domain}` : '');
    apiBaseUrl = process.env['API_BASE_URL'] ?? (domain ? `https://${domain}/api` : '');
    if (!baseUrl || !apiBaseUrl) {
      console.error('QA mode requires BASE_URL and API_BASE_URL, or DOMAIN_NAME to derive them.');
      console.error('CI sets them from the qa environment; locally, use server/.env.qa.');
      process.exit(1);
    }

    // The WAF gate asks for basic auth on every qa page (not /api/); the username is the host.
    basicAuthPassword = process.env['BASIC_AUTH_PASSWORD']?.trim() ?? '';
    if (!basicAuthPassword) {
      console.error('QA mode requires BASIC_AUTH_PASSWORD (the qa basic-auth password).');
      console.error('CI reads the qa environment secret; locally, set it in server/.env.qa.');
      process.exit(1);
    }
  } else {
    baseUrl = 'http://localhost:5173';
    apiBaseUrl = 'http://localhost:3000/api';
  }

  if (!fs.existsSync(PYTHON)) {
    console.error("Run 'npm run test:install' first to create .venv and install deps.");
    process.exit(1);
  }

  // Private-repo GitHub runners have 2 vCPUs: more workers than CPUs leaves pages stuck on the
  // route spinner and hung pages time out even their failure screenshots.
  const workers = Number(process.env['E2E_WORKERS'] ?? Math.min(4, os.availableParallelism()));
  if (!Number.isInteger(workers) || workers < 0) {
    console.error(`E2E_WORKERS must be a whole number >= 0, got "${process.env['E2E_WORKERS']}".`);
    process.exit(1);
  }

  // --browser is passed only here: pytest.ini must not repeat it, or pytest-playwright
  // parameterizes every test once per occurrence and the whole suite runs twice.
  const args = [
    '-m',
    'pytest',
    'tests/e2e',
    '-v',
    '--browser',
    'chromium',
    '--base-url',
    baseUrl,
    '--html=artifacts/report.html',
    '--self-contained-html',
  ];

  if (workers > 0) {
    args.push('-n', String(workers), '--dist', 'loadgroup');
  }

  if (headed) {
    args.push('--headed');
  }

  const errorsDir = path.join(ROOT, 'artifacts', 'errors');
  if (fs.existsSync(errorsDir)) {
    fs.rmSync(errorsDir, { recursive: true });
  }
  fs.mkdirSync(errorsDir, { recursive: true });

  run(PYTHON, args, {
    env: {
      ...process.env,
      BASE_URL: baseUrl,
      API_BASE_URL: apiBaseUrl,
      BASIC_AUTH_PASSWORD: basicAuthPassword,
    },
  });
}

const sub = process.argv[2];
if (sub === 'install') {
  cmdInstall();
} else if (sub === 'run') {
  cmdRun();
} else {
  console.error('Usage: npx tsx tests/scripts/run-tests.ts <install|run> [--headed] [--qa]');
  process.exit(1);
}
