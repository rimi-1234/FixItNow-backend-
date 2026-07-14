import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default {
  // আপনার ইমেজ অনুযায়ী সঠিক পাথ:
  schema: "prisma/models",
  migrations: {
    path: "prisma/migrations",
    seed: 'npx tsx ./prisma/models/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};