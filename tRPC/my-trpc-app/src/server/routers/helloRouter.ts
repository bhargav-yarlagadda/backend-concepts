import z from 'zod'
import {router,publicProcedure} from '../trpc'

export const helloRouter = router({
    // creating a procedute 
    greet : publicProcedure.
    input(z.object({name:z.string})) // input validation 
    .query(({input})=>{
        // query is similar to GET 
        return `hello ${input.name}`
    }),
    getTime:publicProcedure.query(()=>{
        return `current time :${Date.now()}`
    }),
     // ✅ 3. Mutation to save a message
  saveMessage: publicProcedure
    .input(z.object({ name: z.string(), message: z.string() }))
    .mutation(({ input }) => {
      // Normally you would save to a DB; here we mock it
      console.log(`Saving message: ${input.name} said "${input.message}"`);
      return {
        success: true,
        savedAt: new Date().toISOString(),
      };
    }),

  // ✅ 4. Mutation to add numbers
  addNumbers: publicProcedure
    .input(z.object({ a: z.number(), b: z.number() }))
    .mutation(({ input }) => {
      return {
        result: input.a + input.b,
      };
    }),

})