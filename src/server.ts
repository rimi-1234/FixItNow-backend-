import app from "./app.js";
import config from "./config/index.js";
import prisma from "./lib/prisma.js";

const warmUpDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection warmed up.");
  } catch {
    console.warn("Database warm-up ping failed — first request may be slow.");
  }
};

const startServer = () => {
  // On Vercel the app is exported as a serverless function — do not listen.
  if (process.env.VERCEL) return;

  const port = Number(config.port) || 5000;
  app.listen(port, () => {
    console.log(`FixItNow API server running on port ${port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${port}/health`);
    warmUpDatabase();
  });
};

startServer();

export default app;
