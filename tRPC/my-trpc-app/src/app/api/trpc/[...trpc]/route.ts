import { appRouter } from "@/server/routers/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/server/trpc";
import { NextRequest } from "next/server";

// Handles all requests to /api/trpc/* with context (for auth, etc)
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // Pass request to context for middleware/auth
    createContext: () => createContext({ req }),
  });

// Export handlers for GET and POST
export { handler as GET, handler as POST };
