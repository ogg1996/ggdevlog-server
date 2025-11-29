import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const introduceRouter = express.Router();

// 자기소개 데이터 불러오기
introduceRouter.get('/', async (req, res) => {
  const introduce = JSON.parse(
    fs.readFileSync(process.env.INTRODUCE_FILE_PATH),
    'utf-8'
  );

  res.json(introduce);
});

// 자기소개 데이터 수정하기
introduceRouter.put('/', async (req, res) => {
  const { content, images } = req.body;

  fs.writeFileSync(
    process.env.INTRODUCE_FILE_PATH,
    JSON.stringify({ content, images }, null, 2)
  );
  res.json({ message: '자기소개 수정 완료', content, images });
});

export default introduceRouter;
