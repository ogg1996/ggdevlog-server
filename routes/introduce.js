import express from 'express';

import { requireEnv } from '../util/requireEnv.js';
import { validateToken } from '../util/validateToken.js';
import { success } from '../util/response.js';
import { readJSON, writeJSON } from '../util/file.js';

const introduceRouter = express.Router();

const INTRODUCE_FILE_PATH = requireEnv('INTRODUCE_FILE_PATH');

// 자기소개 불러오기
introduceRouter.get('/', async (req, res) => {
  const data = await readJSON(INTRODUCE_FILE_PATH);
  success(res, '자기소개 로드 성공', data);
});

// 자기소개 수정하기
introduceRouter.put('/', validateToken, async (req, res) => {
  const { content, images } = req.body;

  await writeJSON(INTRODUCE_FILE_PATH, { content, images });
  success(res, '자기소개 수정 완료', { content, images });
});

export default introduceRouter;
