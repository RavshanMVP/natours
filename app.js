import express from 'express';
import morgan from 'morgan';
const app = express();
import tourRouter from './routes/tour routes.js';
import userRouter from './routes/user routes.js';
import appError        from './utils/appError.js';
import errorController from './controllers/errorController.js';

if(process.env.NODE_ENV === "development") {
  app.use (morgan ('dev'));
}

app.use(express.json());
app.use(express.static("./public"))

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all("*",(req, res, next)=>{
  next(new appError(`Can't find ${req.originalUrl}`, 404));
})

app.use(errorController);

export default app;