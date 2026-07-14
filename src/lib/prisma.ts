import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/index.js';

if (!config.database_url) {
  throw new Error('DATABASE_URL is missing. Set it in the Vercel project environment variables.');
}

const pool = new Pool({
  connectionString: config.database_url,
  ssl: config.database_url.includes('localhost')
    ? undefined
    : { rejectUnauthorized: false },
  max: 1, // serverless-friendly
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
export default prisma;
