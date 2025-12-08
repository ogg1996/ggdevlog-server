import express from 'express';
import supabase from '../supabase/client.js';

import { validateToken } from '../util/validateToken.js';
import { fail, success } from '../util/response.js';

const boardRouter = express.Router();

/**
 * @swagger
 * tags:
 *  - name: Board
 *    description: 게시판 관련 API
 */

/**
 * @swagger
 * /board:
 *  get:
 *    tags: [Board]
 *    summary: 게시판 목록 조회
 *    description: 게시판 목록을 불러온다.
 *    responses:
 *      200:
 *        description: 게시판 목록 조회 성공
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
 *                  example: "게시판 목록 조회 성공"
 *                data:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: number
 *                        example: 1
 *                      name:
 *                        type: string
 *                        example: "Javascript"
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
boardRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('board')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 목록 조회 성공', data);
});

/**
 * @swagger
 * /board:
 *  post:
 *    tags: [Board]
 *    summary: 게시판 추가
 *    description: 게시판을 추가한다.
 *    security:
 *      - cookieAuth: []
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 게시판 이름
 *           example:
 *             name: "React"
 *    responses:
 *      200:
 *        description: 게시판 추가 성공
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
 *                  example: "게시판 추가 성공"
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
boardRouter.post('/', validateToken, async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('board').insert({ name });

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 추가 성공');
});

/**
 * @swagger
 * /board/:id:
 *  put:
 *    tags: [Board]
 *    summary: 게시판 수정
 *    description: 게시판을 수정한다.
 *    security:
 *      - cookieAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: 게시판의 ID
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 게시판 이름
 *           example:
 *             name: "React"
 *    responses:
 *      200:
 *        description: 게시판 수정 성공
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
 *                  example: "게시판 수정 성공"
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
boardRouter.put('/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const { error } = await supabase
    .from('board')
    .update({ name })
    .eq('id', Number(id));

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 수정 성공');
});

/**
 * @swagger
 * /board/:id:
 *  delete:
 *    tags: [Board]
 *    summary: 게시판 삭제
 *    description: 게시판을 삭제한다.
 *    security:
 *      - cookieAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: 게시판의 ID
 *    responses:
 *      200:
 *        description: 게시판 삭제 성공
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
 *                  example: "게시판 삭제 성공"
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
boardRouter.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('board').delete().eq('id', Number(id));

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 삭제 성공');
});

export default boardRouter;
