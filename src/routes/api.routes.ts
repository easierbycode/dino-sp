import { Router } from "@oak/oak/router";

export const apiRouter = new Router({ prefix: "/api" });

// Health check endpoint
apiRouter.get("/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    message: "🦕 dino-sp - Dino server is healthy!",
  };
});
