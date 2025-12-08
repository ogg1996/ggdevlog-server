import express from 'express';
import supabase from '../supabase/client.js';

import { validateToken } from '../util/validateToken.js';
import { fail, success } from '../util/response.js';

const introduceRouter = express.Router();

/**
 * @swagger
 * tags:
 *  - name: Introduce
 *    description: 자기소개 관련 API
 */

/**
 * @swagger
 * /introduce:
 *  get:
 *    tags: [Introduce]
 *    summary: 자기소개 조회
 *    description: 자기소개를 불러온다.
 *    responses:
 *      200:
 *        description: 자기소개 조회 성공
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
 *                  example: "자기소개 조회 성공"
 *                data:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      example: "<h2>임시 에디터를 작성 했습니다.</h2>"
 *                    images:
 *                      type: array
 *                      items:
 *                        type: string
 *                        example: "img_1232141412.png"
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
 *
 */
introduceRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('introduce')
    .select('content, images')
    .eq('id', 1)
    .single();

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '자기소개 조회 성공', data);
});

/**
 * @swagger
 * /Introduce:
 *  put:
 *    tags: [Introduce]
 *    summary: 자기소개 수정
 *    description: 자기소개를 수정한다.
 *    security:
 *      - cookieAuth: []
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - images
 *             properties:
 *               content:
 *                 type: string
 *                 description: HTML TEXT
 *               images:
 *                 type: array
 *                 description: 자기소개 데이터에 들어간 이미지 목록
 *           example:
 *             content: "<h2>임시 에디터를 작성 했습니다.</h2>"
 *             images: ["img_1232141412.png"]
 *    responses:
 *      200:
 *        description: 자기소개 수정 완료
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
 *                  example: "자기소개 수정 완료"
 *                data:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      example: "<h2>임시 에디로 에디터를 작성 했습니다.</h2>"
 *                    images:
 *                      type: array
 *                      items:
 *                        type: string
 *                        example: "img_1232141412.png"
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
introduceRouter.put('/', validateToken, async (req, res) => {
  const { content, images } = req.body;

  const { error } = await supabase
    .from('introduce')
    .update({ content, images })
    .eq('id', 1);

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '자기소개 수정 완료', { content, images });
});

export default introduceRouter;
