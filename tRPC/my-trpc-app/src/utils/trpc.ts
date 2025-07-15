// tRPC client setup for Next.js App Router (React Query)
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/root";

export const trpc = createTRPCReact<AppRouter>();
