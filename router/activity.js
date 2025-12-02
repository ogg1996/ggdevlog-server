import express from 'express';

import { requireEnv } from '../util/validateEnv.js';
import { readJSON, writeJSON } from '../util/file.js';
import { success } from '../util/response.js';

const activityRouter = express.Router();

const ACTIVITY_FILE_PATH = requireEnv('ACTIVITY_FILE_PATH');

// 활동 데이터 불러오기
activityRouter.get('/', async (req, res) => {
  const data = await readJSON(ACTIVITY_FILE_PATH);

  success(res, '활동 데이터 로드 성공', data);
});

// 활동 카운트 증가
activityRouter.post('/', async (req, res) => {
  const data = await readJSON(ACTIVITY_FILE_PATH);

  const today = new Date().toISOString().slice(0, 10);

  data[today] = (data[today] || 0) + 1;

  await writeJSON(ACTIVITY_FILE_PATH, data);

  success(res, '활동 기록 카운트 증가 완료');
});

export default activityRouter;
