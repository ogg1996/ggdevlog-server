import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './router/auth.js';
import boardRouter from './router/board.js';
import postRouter from './router/post.js';
import imgRouter from './router/img.js';
import activityRouter from './router/activity.js';
import introduceRouter from './router/introduce.js';

const app = express();

app.set('port', process.env.PORT || 3000);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

app.use('/auth', authRouter);
app.use('/activity', activityRouter);
app.use('/introduce', introduceRouter);
app.use('/board', boardRouter);
app.use('/post', postRouter);
app.use('/img', imgRouter);

app.listen(app.get('port'), () => {
  console.log(`Server port number: ${app.get('port')}`);
});
