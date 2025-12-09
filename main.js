import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { requireEnv } from './util/requireEnv.js';

import authRouter from './routes/auth.js';
import boardRouter from './routes/board.js';
import postRouter from './routes/post.js';
import imgRouter from './routes/img.js';
import activityRouter from './routes/activity.js';
import introduceRouter from './routes/introduce.js';
import { specs, swaggerUi } from './swagger.js';

const app = express();

const CLIENT_URL = requireEnv('CLIENT_URL');

app.set('port', process.env.PORT || 3000);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000', CLIENT_URL],
    credentials: true
  })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/auth', authRouter);
app.use('/activity', activityRouter);
app.use('/introduce', introduceRouter);
app.use('/board', boardRouter);
app.use('/post', postRouter);
app.use('/img', imgRouter);

app.get('/', (req, res) => {
  res.send('GGDevLog Server!');
});

app.listen(app.get('port'), () => {
  console.log(`Server port number: ${app.get('port')}`);
});
