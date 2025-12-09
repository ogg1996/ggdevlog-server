import jwt from 'jsonwebtoken';

import { fail } from './response.js';
import { requireEnv } from './requireEnv.js';

const JWT_SECRET = requireEnv('JWT_SECRET');

// 토큰 검증 미들웨어
export function validateToken(req, res, next) {
  const token = req.cookies.auth;

  if (!token) return fail(res, '인증 토큰 없음', 401);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return fail(res, '유효하지 않은 인증 토큰', 401);
  }
}
