import { io } from "socket.io-client";


//  creating a client for conneting to socket backend
const socket = io('http://localhost:4000',{
    transports:['websocket'],
})
export default socket