import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

import { requireEnv } from '../util/validateEnv.js';
import { success, fail } from '../util/response.js';

const authRouter = express.Router();

const JWT_SECRET = requireEnv('JWT_SECRET');
const ADMIN_PW_HASH = requireEnv('ADMIN_PW_HASH');

// 토큰 검증 미들웨어
export function tokenValidation(req, res, next) {
  const token = req.cookies.auth;

  if (!token) return fail(res, '인증 토큰 없음', 401);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return fail(res, '유효하지 않은 인증 토큰', 401);
  }
}

// 접근권한 확인
authRouter.get('/accessCheck', tokenValidation, (req, res) => {
  success(res, '접근 승인');
});

// 로그인 횟수 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => fail(res, '로그인 시도 횟수 초과', 429)
});

// 로그인
authRouter.post('/login', loginLimiter, async (req, res) => {
  const { pw } = req.body;
  const match = await bcrypt.compare(pw, ADMIN_PW_HASH);

  if (!match) return fail(res, '로그인 실패', 401);

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: '6h'
  });

  res.cookie('auth', token, {
    httpOnly: true,
    secure: false, // 배포시 true로 변경
    sameSite: 'strict',
    maxAge: 6 * 60 * 60 * 1000
  });

  success(res, '관리자 권한 승인');
});

// 로그아웃
authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth');
  success(res, '관리자 권한 해제');
});

export default authRouter;
