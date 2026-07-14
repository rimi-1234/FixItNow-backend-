import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env');
  process.exit(1);
}

const stripeBin = path.join(root, 'tools', 'stripe', 'stripe.exe');

const child = spawn(
  stripeBin,
  [
    'listen',
    '--forward-to',
    'localhost:5000/api/payments/confirm',
    '--api-key',
    apiKey,
    '--events',
    'checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed',
  ],
  { stdio: 'inherit', cwd: root }
);

child.on('exit', (code) => process.exit(code ?? 1));
