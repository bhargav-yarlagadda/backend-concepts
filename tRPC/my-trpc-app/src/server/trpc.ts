
import { ZodError } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import type { NextRequest } from "next/server";
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
// tRPC context: add user info for auth (dummy for demo)
export const createContext = async (opts?: { req?: NextRequest }) => {
  // In real apps, extract user from request/session
  return { user: opts?.req?.headers?.get("x-user") || null };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

// Example middleware: require user to be authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
