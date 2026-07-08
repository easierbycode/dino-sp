import { Application } from "@oak/oak/application";
import { apiRouter } from "./routes/api.routes.ts";
import { leaderboardRoutes } from "./routes/leaderboard.routes.ts";
import { customizationRoutes } from "./routes/customization.routes.ts";
import { databaseMiddleware } from "./middleware/database.ts";
import { initializeDatabase } from "./database/migrations.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8004");
const HOST = Deno.env.get("HOST") || "localhost";

// Built client (vite build output)
const DIST_ROOT = `${Deno.cwd()}/dist`;

const app = new Application();

// Initialize database on startup
try {
  await initializeDatabase();
} catch (error) {
  console.error("❌ Failed to initialize database:", error);
  console.log("⚠️ Continuing without database (some features may not work)");
}

// CORS middleware for API requests
app.use(async (context, next) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  context.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (context.request.method === "OPTIONS") {
    context.response.status = 200;
    return;
  }
  await next();
});

// Database middleware for API routes
app.use(databaseMiddleware);

// Serve the built Svelte client from dist/
app.use(async (context, next) => {
  // API requests fall through to the routers
  if (context.request.url.pathname.startsWith("/api")) {
    await next();
    return;
  }

  try {
    // SPA route: the client renders the leaderboard page at /leaderboard
    // (also accept a trailing slash and the original's /leaderboard.html)
    const pathname = context.request.url.pathname.replace(/\/+$/, "");
    if (pathname === "/leaderboard" || pathname === "/leaderboard.html") {
      await context.send({ root: DIST_ROOT, path: "index.html" });
      return;
    }

    await context.send({ root: DIST_ROOT, index: "index.html" });
  } catch {
    await next();
  }
});

// API routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

app.use(leaderboardRoutes.routes());
app.use(leaderboardRoutes.allowedMethods());

app.use(customizationRoutes.routes());
app.use(customizationRoutes.allowedMethods());

app.listen({
  port: PORT,
});

console.log(`🦕 Server is running on http://${HOST}:${PORT}`);
console.log(`🎯 Visit http://${HOST}:${PORT} to see the game`);
console.log(`🔧 API health check at http://${HOST}:${PORT}/api/health`);
console.log(`🏆 Global Leaderboard at http://${HOST}:${PORT}/leaderboard`);
console.log(`🏆 Leaderboard API at http://${HOST}:${PORT}/api/leaderboard`);
console.log(
  `🎨 Customization API at http://${HOST}:${PORT}/api/customization/options`,
);
