import express from 'express'
import restrauntsRouter from './routers/restraunts.js'
import cuisineRouters from './routers/cusines.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initialiseRedisClient } from './utils/client.js'

const PORT = 4000
const app = express()
app.use(express.json())
app.use(errorHandler)
app.use("/cuisines",cuisineRouters)
app.use('/restraunts',restrauntsRouter)
app.listen(PORT,()=>{
    console.log("app running on port:4000")
})