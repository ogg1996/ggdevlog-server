import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const activityRouter = express.Router();

// 활동 데이터 불러오기
activityRouter.get('/', async (req, res) => {
  const filePath = process.env.ACTIVITY_FILE_PATH;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }

  const activity = JSON.parse(
    fs.readFileSync(process.env.ACTIVITY_FILE_PATH),
    'utf-8'
  );

  res.json(activity);
});

// 활동 카운트 증가
activityRouter.post('/', async (req, res) => {
  const filePath = process.env.ACTIVITY_FILE_PATH;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const today = new Date().toISOString().slice(0, 10);

  raw[today] = (raw[today] || 0) + 1;

  fs.writeFileSync(
    process.env.ACTIVITY_FILE_PATH,
    JSON.stringify(raw, null, 2)
  );

  res.json({ message: '활동 기록 카운트 증가 완료' });
});

export default activityRouter;
