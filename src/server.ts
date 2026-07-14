import app from "./app.js";
import config from "./config/index.js";

const startServer = () => {
  // On Vercel the app is exported as a serverless function — do not listen.
  if (process.env.VERCEL) return;

  const port = Number(config.port) || 5000;
  app.listen(port, () => {
    console.log(`FixItNow API server running on port ${port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
};

startServer();

export default app;
