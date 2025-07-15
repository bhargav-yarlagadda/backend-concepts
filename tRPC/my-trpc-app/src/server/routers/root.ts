import { router } from "../trpc";
import { helloRouter } from "./helloRouter";
import { postRouter } from "./postRouter";

// Root router combines all sub-routers for modular structure
export const appRouter = router({
  hello: helloRouter, // /hello/*
  post: postRouter, // /post/*
});

// 👇 Export the type for frontend type inference
export type AppRouter = typeof appRouter;
