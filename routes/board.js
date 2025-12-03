import express from 'express';
import supabase from '../supabase/client.js';

import { validateToken } from '../util/validateToken.js';
import { fail, success } from '../util/response.js';

const boardRouter = express.Router();

// 게시판 목록 불러오기
boardRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('board')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 목록 로드 성공', data);
});

// 게시판 추가
boardRouter.post('/', validateToken, async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('board').insert({ name });

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 추가 성공');
});

// 게시판 수정
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

// 게시판 삭제
boardRouter.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('board').delete().eq('id', Number(id));

  if (error) return fail(res, 'DB 오류', 500);
  success(res, '게시판 삭제 성공');
});

export default boardRouter;
