import express from 'express';
import supabase from '../supabase/client.js';

import { validateToken } from '../util/validateToken.js';
import { fail, success } from '../util/response.js';

const activityRouter = express.Router();

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
 *                  properties:
 *                    date:
 *                      type: string
 *                      example: "2025-01-01"
 *                    count:
 *                      type: number
 *                      example: 1
 *      500:
 *        description: DB 오류
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
 *                  example: "DB 오류"
 */
activityRouter.get('/', async (req, res) => {
  const { data, error } = await supabase.from('activity').select('date, count');

  if (error) return fail(res, 'DB오류', 500);

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
 *      500:
 *        description: DB 오류
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
 *                  example: "DB 오류"
 */
activityRouter.post('/', validateToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const { data: readData, error: readError } = await supabase
    .from('activity')
    .select('count')
    .eq('date', today)
    .single();

  if (readError && readError.code !== 'PGRST116')
    return fail(res, 'DB오류', 500);

  let updateResponse;

  if (readData) {
    updateResponse = await supabase
      .from('activity')
      .update({ count: readData.count + 1 })
      .eq('date', today);
  } else {
    updateResponse = await supabase
      .from('activity')
      .insert({ date: today, count: 1 });
  }

  if (updateResponse.error) return fail(res, 'DB오류', 500);

  success(res, '활동 카운트 증가 완료');
});

export default activityRouter;
