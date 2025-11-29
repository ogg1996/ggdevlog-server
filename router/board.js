import express from 'express';
import supabase from '../supabase/client.js';

const boardRouter = express.Router();

// 게시판 목록 불러오기
boardRouter.get('/', async (req, res) => {
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
boardRouter.post('/', async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('board').insert({ name });
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시판 추가 성공' });
});

// 게시판 수정
boardRouter.put('/:id', async (req, res) => {
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
boardRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('board').delete().eq('id', Number(id));
  if (error)
    return res
      .status(500)
      .json({ success: false, message: '데이터베이스 오류' });
  res.json({ success: true, message: '게시판 삭제 성공' });
});

export default boardRouter;
