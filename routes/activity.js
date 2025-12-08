import express from 'express';

import { requireEnv } from '../util/requireEnv.js';
import { validateToken } from '../util/validateToken.js';
import { readJSON, writeJSON } from '../util/file.js';
import { success } from '../util/response.js';

const activityRouter = express.Router();

const ACTIVITY_FILE_PATH = requireEnv('ACTIVITY_FILE_PATH');

/**
 * @swagger
 * tags:
 *  - name: Activity
 *    description: 활동 기록 관련 API
 */

/**
 * @swagger
 * /activity:
 *  get:
 *    tags: [Activity]
 *    summary: 활동 데이터 조회
 *    description: 날짜별 활동 횟수를 불러온다.
 *    responses:
 *      200:
 *        description: 활동 데이터 조회 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: string
 *                  example: "활동 데이터 조회 성공"
 *                data:
 *                  type: object
 *                  additionalProperties:
 *                    type: integer
 *                  example:
 *                    "2025-01-01": 3
 *                    "2025-01-02": 5
 *
 */
activityRouter.get('/', async (req, res) => {
  const data = await readJSON(ACTIVITY_FILE_PATH);

  success(res, '활동 데이터 조회 성공', data);
});

/**
 * @swagger
 * /activity:
 *  post:
 *    tags: [Activity]
 *    summary: 오늘의 활동 카운트 증가
 *    description: 오늘의 활동 카운트를 증가시킨다.
 *    security:
 *      - cookieAuth: []
 *    responses:
 *      200:
 *        description: 활동 카운트 증가 완료
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: string
 *                  example: "활동 카운트 증가 완료"
 *      401:
 *        description: 토큰 인증 실패
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  example: false
 *                message:
 *                  type: string
 *                  example: "인증 토큰 없음 or 유효하지 않은 인증 토큰"
 */
activityRouter.post('/', validateToken, async (req, res) => {
  const data = await readJSON(ACTIVITY_FILE_PATH);

  const today = new Date().toISOString().slice(0, 10);

  data[today] = (data[today] || 0) + 1;

  await writeJSON(ACTIVITY_FILE_PATH, data);

  success(res, '활동 카운트 증가 완료');
});

export default activityRouter;
