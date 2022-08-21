import dotenv    from 'dotenv';
import mongoose  from 'mongoose';

dotenv.config({
  path: './config.env',
});
import app       from './app.js';
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log('Mongo DB is connected successfully');
});

const server = app.listen(port, () => {
  console.log('Listening at port ' + port);
});

process.on("unhandledRejection", (err)=>{
  console.log(err.name, err.message);
  server.close(()=>process.exit(1));
});

process.on("uncaughtException", (err)=>{
  console.log(err.name, err.message);
  server.close(()=>process.exit(1));
});
