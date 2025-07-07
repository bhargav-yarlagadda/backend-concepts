import Express from 'express'; 
import { json } from 'express';
import { throttleMiddleware } from './middleware.js';


const app = Express();
app.use(json()); 
app.use(throttleMiddleware); // Apply the throttle middleware
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});