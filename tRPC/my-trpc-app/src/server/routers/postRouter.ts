import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

// Post router demonstrates nested routers and error handling
const posts = [
  { id: 1, title: "First Post", content: "Hello world", author: "alice" },
  { id: 2, title: "Second Post", content: "tRPC is awesome", author: "bob" },
];

export const postRouter = router({
  // Get all posts
  all: publicProcedure.query(() => posts),

  // Get post by ID with error handling
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const post = posts.find((p) => p.id === input.id);
      if (!post) throw new Error("Post not found");
      return post;
    }),

  // Create post (protected, requires auth)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        content: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      const newPost = {
        id: posts.length + 1,
        ...input,
        author: ctx.user || "unknown",
      };
      posts.push(newPost);
      return newPost;
    }),
});
