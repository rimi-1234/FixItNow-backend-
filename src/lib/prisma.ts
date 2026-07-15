import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/index.js';

if (!config.database_url) {
  throw new Error('DATABASE_URL is missing. Set it in the Vercel project environment variables.');
}

const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

const pool = new Pool({
  connectionString: config.database_url,
  ssl: config.database_url.includes('localhost')
    ? undefined
    : { rejectUnauthorized: false },
  max: isServerless ? 3 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
export default prisma;
