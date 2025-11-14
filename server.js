import { createClient } from '@supabase/supabase-js';
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const upload = multer({ dest: 'temp/' });

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

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

const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
const OWNER = 'ogg1996';
const REPO = 'ggdevlog-img-uploads';
const BRANCH = 'main';

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_API_KEY
);

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

// 로그인
app.post('/login', loginLimiter, async (req, res) => {
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
app.post('/logout', (req, res) => {
  res.clearCookie('auth');
  res.json({ success: true, message: '로그아웃 성공' });
});

// 접근 권한 확인
app.get('/accessCheck', tokenValidation, (req, res) => {
  res.json({ success: true, message: '접근 승인' });
});

// 자기소개 데이터 불러오기
app.get('/introduce', async (req, res) => {
  const introduce = JSON.parse(
    fs.readFileSync(process.env.INTRODUCE_FILE_PATH),
    'utf-8'
  );

  res.json(introduce);
});

// 자기소개 데이터 수정하기
app.put('/introduce', async (req, res) => {
  const { content, images } = req.body;

  fs.writeFileSync(
    process.env.INTRODUCE_FILE_PATH,
    JSON.stringify({ content, images }, null, 2)
  );
  res.json({ message: '자기소개 수정 완료', content, images });
});

// 게시글 목록 불러오기
app.get('/post', async (req, res) => {
  const boardName = req.query.board_name || 'all';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('post')
    .select(
      'id, board:board_id!inner(id, name), thumbnail, title, description, created_at',
      {
        count: 'exact'
      }
    )
    .order('created_at', { ascending: false });

  if (boardName !== 'all') {
    query = query.eq('board.name', boardName);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) return res.status(500).json({ message: '데이터베이스 오류' });

  res.json({
    board_name: boardName,
    page,
    limit,
    total: count,
    totalPage: Math.ceil(count / limit),
    data
  });
});

// 게시글 상세보기
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('post')
    .select(
      'id, board:board_id (id, name), title, description, thumbnail, content, images, created_at, updated_at'
    )
    .eq('id', Number(id))
    .single();

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true, data });
});

// 게시글 추가
app.post('/post', async (req, res) => {
  const { board_id, title, thumbnail, description, content, images } = req.body;
  const { data, error } = await supabase
    .from('post')
    .insert({ board_id, title, thumbnail, description, content, images })
    .select();

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });

  res.json({ success: true, message: '게시글 작성 성공', post_id: data[0].id });
});

// 게시글 수정
app.put('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { board_id, title, thumbnail, description, content, images } = req.body;

  const { data, error } = await supabase
    .from('post')
    .update({ board_id, title, thumbnail, description, content, images })
    .eq('id', Number(id))
    .select();

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시글 수정 성공', post_id: data[0].id });
});

// 게시글 삭제
app.delete('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await supabase
      .from('post')
      .select('id, board:board_id (id, name), thumbnail, images')
      .eq('id', Number(id))
      .single();

    if (data) {
      await axios.delete('http://localhost:4050/img', {
        data: [
          ...(data.thumbnail ? [data.thumbnail.image_name] : []),
          ...(data.images?.length ? data.images : [])
        ]
      });

      await supabase.from('post').delete().eq('id', Number(id));

      res.json({
        success: true,
        message: '게시글 삭제 성공',
        board_name: data.board.name
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: '데이터베이스 오류' });
  }
});

// 게시판 목록 불러오기
app.get('/board', async (req, res) => {
  const { data, error } = await supabase
    .from('board')
    .select('id, name')
    .order('name', { ascending: true });

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, data });
});

// 게시판 추가
app.post('/board', async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('board').insert({ name });
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시판 추가 성공' });
});

// 게시판 수정
app.put('/board/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { error } = await supabase
    .from('board')
    .update({ name })
    .eq('id', Number(id));
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시판 수정 성공' });
});

// 게시판 삭제
app.delete('/board/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('board').delete().eq('id', Number(id));
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시판 삭제 성공' });
});

// 이미지 업로드
app.post('/img', upload.single('img'), async (req, res) => {
  try {
    const ext = path.extname(req.file.originalname);
    const filePath = req.file.path;
    const fileName = 'img_' + Date.now() + ext;

    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
    fs.unlinkSync(filePath);

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${fileName}`;

    const response = await axios.put(
      url,
      {
        message: `upload image: ${fileName}`,
        content: fileContent,
        branch: BRANCH
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`
        }
      }
    );

    const imageUrl = response.data.content.download_url;

    res.json({
      img_name: fileName,
      img_url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: '업로드 실패' });
  }
});

// 이미지 삭제
app.delete('/img', async (req, res) => {
  try {
    const images = req.body;

    for (const image of images) {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${image}`;

      const response = await axios.get(url + `?ref=${BRANCH}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`
        }
      });

      const sha = response.data.sha;

      await axios.delete(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`
        },
        data: {
          message: `delete image: ${image}`,
          sha,
          branch: BRANCH
        }
      });
    }
    res.status(200).json({ message: '삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '삭제 실패' });
  }
});

app.listen(4050, () => {
  console.log('Port: 4050 open');
});
