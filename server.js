import { createClient } from '@supabase/supabase-js';
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'temp/' });

app.use(express.json());
app.use(cors());

const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
const OWNER = 'ogg1996';
const REPO = 'ggdevlog-img-uploads';
const BRANCH = 'main';

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_API_KEY
);

// 게시글 목록 불러오기
app.get('/post', async (req, res) => {
  const board = Number(req.query.board_id) || null;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('post')
    .select('id, thumbnail, title, description, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (board) {
    query = query.eq('board_id', board);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) return res.status(500).json({ success: false });

  res.json({
    success: true,
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
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true, data });
});

// 게시글 추가
app.post('/post', async (req, res) => {
  const { board_id, title, thumbnail, description, content, images } = req.body;
  const { error } = await supabase
    .from('post')
    .insert({ board_id, title, thumbnail, description, content, images });

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '게시글 작성 실패' });

  res.json({ success: true, message: '게시글 작성 성공' });
});

// 게시글 수정
app.put('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { board_id, title, thumbnail, description, content, images } = req.body;

  const { error } = await supabase
    .from('post')
    .update({ board_id, title, thumbnail, description, content, images })
    .eq('id', Number(id));

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '게시글 수정 실패' });
  res.json({ success: true, message: '게시글 수정 성공' });
});

// 게시글 삭제
app.delete('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('post').delete().eq('id', Number(id));

  if (error)
    return res
      .status(500)
      .json({ success: false, message: '게시글 삭제 실패' });

  res.json({ success: true, message: '게시글 삭제 성공' });
});

// 게시판 목록 불러오기
app.get('/board', async (req, res) => {
  const { data, error } = (
    await supabase.from('board').select('id, name')
  ).order('name', { ascending: true });

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true, data });
});

// 게시판 추가
app.post('/board', async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('board').insert({ name });
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '게시판 추가 실패' });
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
      .json({ success: false, message: '게시판 수정 실패' });
  res.json({ success: true, message: '게시판 수정 성공' });
});

// 게시판 삭제
app.delete('/board/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('board').delete().eq('id', Number(id));
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '게시판 삭제 실패' });
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
