import { createClient } from "redis";
let client = null
export async function initialiseRedisClient() {
    if (!client) {
        // creatting a  new client
        client = createClient()
        client.on("error", (error) => {
            console.log("Error in Initializing Client: ", error)
        })
        client.on("connect", () => {
            console.log("connected to redis successfully.")
        })
    }
    await client.connect()
    return client
} 