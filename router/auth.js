import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const authRouter = express.Router();

// 토큰 검증
function tokenValidation(req, res, next) {
  const token = req.cookies.auth;

  if (!token) return res.json({ success: false, message: '토큰이 없음' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.json({ success: false, message: '유효한 토큰이 아님' });
  }
}

// 접근 권한 확인
authRouter.get('/accessCheck', tokenValidation, (req, res) => {
  res.json({ success: true, message: '접근 승인' });
});

// 로그인 횟수 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) =>
    res.json({
      success: false,
      message: '로그인 시도 횟수 초과'
    })
});

// 로그인
authRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { pw } = req.body;

    const match = await bcrypt.compare(pw, process.env.ADMIN_PW_HASH);

    if (!match)
      return res.json({
        success: false,
        message: '비밀번호 불일치'
      });

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '6h'
    });

    res.cookie('auth', token, {
      httpOnly: true,
      secure: false, // 배포시 true로 변경
      sameSite: 'strict',
      maxAge: 6 * 60 * 60 * 1000
    });

    return res.json({ success: true, message: '관리자 권한 승인' });
  } catch (e) {
    return res.json({ success: false, message: '서버 오류' });
  }
});

// 로그아웃
authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth');
  res.json({ success: true, message: '로그아웃 성공' });
});

export default authRouter;
