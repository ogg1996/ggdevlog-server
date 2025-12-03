import express from 'express';
import supabase from '../supabase/client.js';
import axios from 'axios';
import { fail, success } from '../util/response.js';

const postRouter = express.Router();

// 게시글 목록 불러오기
postRouter.get('/', async (req, res) => {
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

  if (boardName !== 'all') query = query.eq('board.name', boardName);

  const { data, error, count } = await query.range(from, to);

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '게시글 목록 로드 성공', {
    board_name: boardName,
    page,
    limit,
    total: count,
    totalPage: Math.ceil(count / limit),
    data
  });
});

// 게시글 상세보기
postRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('post')
    .select(
      'id, board:board_id (id, name), title, description, thumbnail, content, images, created_at, updated_at'
    )
    .eq('id', Number(id))
    .single();

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시글 상세 로드 성공', data);
});

// 게시글 추가
postRouter.post('/', async (req, res) => {
  const { board_id, title, thumbnail, description, content, images } = req.body;
  const { data, error } = await supabase
    .from('post')
    .insert({ board_id, title, thumbnail, description, content, images })
    .select();

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '게시글 작성 성공', { post_id: data[0].id });
});

// 게시글 수정
postRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { board_id, title, thumbnail, description, content, images } = req.body;

  const { data, error } = await supabase
    .from('post')
    .update({ board_id, title, thumbnail, description, content, images })
    .eq('id', Number(id))
    .select();

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '게시글 수정 성공', { post_id: data[0].id });
});

// 게시글 삭제
postRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('post')
    .select('id, board:board_id (id, name), thumbnail, images')
    .eq('id', Number(id))
    .single();

  if (error || !data) return fail(res, '게시글 없음', 404);

  await axios.delete('http://localhost:4050/img', {
    data: [
      ...(data.thumbnail ? [data.thumbnail.image_name] : []),
      ...(data.images?.length ? data.images : [])
    ]
  });

  await supabase.from('post').delete().eq('id', Number(id));

  success(res, '게시글 삭제 성공', { board_name: data.board.name });
});

export default postRouter;
