import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

import { requireEnv } from '../util/requireEnv.js';
import { success, fail } from '../util/response.js';
import { validateToken } from '../util/validateToken.js';

const authRouter = express.Router();

const JWT_SECRET = requireEnv('JWT_SECRET');
const ADMIN_PW_HASH = requireEnv('ADMIN_PW_HASH');

const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict'
};

// 로그인 횟수 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => fail(res, '로그인 시도 횟수 초과', 429)
});

/**
 * @swagger
 * tags:
 *  - name: Auth
 *    description: 관리자 권한 관련 API
 */

/**
 * @swagger
 * /auth/accessCheck:
 *  get:
 *    tags: [Auth]
 *    summary: 접근 권한 확인
 *    description: auth 쿠키의 JWT 토큰으로 접근 권한을 확인한다.
 *    security:
 *      - cookieAuth: []
 *    responses:
 *      200:
 *        description: 접근 승인
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
 *                  example: "접근 승인"
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
authRouter.get('/accessCheck', validateToken, (req, res) => {
  success(res, '접근 승인');
});

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags: [Auth]
 *    summary: 관리자 로그인
 *    description: auth 쿠키에 JWT 토큰을 넣어서 반환하여 관리자 권한을 부여한다.
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pw
 *             properties:
 *               pw:
 *                 type: string
 *                 description: 관리자 비밀번호
 *           example:
 *             pw: "admin1112233"
 *    responses:
 *      200:
 *        description: 관리자 권한 승인
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
 *                  example: "관리자 권한 승인"
 *        headers:
 *           auth:
 *             description: JWT가 담긴 쿠키
 *             schema:
 *               type: cookie
 *      401:
 *        description: 로그인 실패
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
 *                  example: "로그인 실패"
 *      429:
 *        description: 로그인 시도 횟수 초과
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
 *                  example: "로그인 시도 횟수 초과"
 */
authRouter.post('/login', loginLimiter, async (req, res) => {
  const { pw } = req.body;
  const match = await bcrypt.compare(pw, ADMIN_PW_HASH);

  if (!match) return fail(res, '로그인 실패', 401);

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: '6h'
  });

  res.cookie('auth', token, {
    ...COOKIE_SETTINGS,
    maxAge: 6 * 60 * 60 * 1000
  });

  success(res, '관리자 권한 승인');
});

/**
 * @swagger
 * /auth/logout:
 *  post:
 *    tags: [Auth]
 *    summary: 관리자 로그아웃
 *    description: auth 쿠키를 삭제하여 관리자 권한을 해제한다.
 *    responses:
 *      200:
 *        description: 로그아웃 성공
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
 *                  example: "관리자 권한 해제"
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth', COOKIE_SETTINGS);
  success(res, '관리자 권한 해제');
});

export default authRouter;
