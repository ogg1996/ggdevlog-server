import express from 'express';
import supabase from '../supabase/client.js';
import axios from 'axios';

import { validateToken } from '../util/validateToken.js';
import { fail, success } from '../util/response.js';

const postRouter = express.Router();

/**
 * @swagger
 * tags:
 *  - name: Post
 *    description: 게시글 관련 API
 */

/**
 * @swagger
 * /post:
 *  get:
 *    tags: [Post]
 *    summary: 게시글 목록 조회
 *    description: 게시글 목록을 불러온다.
 *    parameters:
 *      - in: query
 *        name: board_name
 *        type: string
 *        description: 게시판 이름
 *      - in: query
 *        name: page
 *        type: number
 *        description: 조회할 페이지
 *      - in: query
 *        name: limit
 *        type: number
 *        description: 한 페이지의 최대 게시글 수
 *    responses:
 *      200:
 *        description: 게시글 목록 조회 성공
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
 *                  example: "게시글 목록 조회 성공"
 *                data:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      board_name:
 *                        type: string
 *                        example: "Javascript"
 *                      page:
 *                        type: number
 *                        example: 1
 *                      limit:
 *                        type: number
 *                        example: 5
 *                      total:
 *                        type: number
 *                        example: 24
 *                      totalPage:
 *                        type: number
 *                        example: 5
 *                      data:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            id:
 *                              type: number
 *                              example: 1
 *                            board:
 *                              type: object
 *                              properties:
 *                                id:
 *                                  type: number
 *                                  example: 1
 *                                name:
 *                                  type: string
 *                                  example: "Javascript"
 *                            title:
 *                              type: string
 *                              example: "게시글의 제목입니다."
 *                            description:
 *                              type: string
 *                              example: "게시글의 설명입니다."
 *                            created_at:
 *                              type: string
 *                              example: "2025-01-01T00:00:00. 07945+00:00"
 *                            thumbnail:
 *                              type: object
 *                              properties:
 *                                img_name:
 *                                  type: string
 *                                  example: "img_1232141412.png"
 *                                img_url:
 *                                  type: string
 *                                  example: "https://example.com/img_1232141412.png"
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

  success(res, '게시글 목록 조회 성공', {
    board_name: boardName,
    page,
    limit,
    total: count,
    totalPage: Math.ceil(count / limit),
    data
  });
});

/**
 * @swagger
 * /post/:id:
 *  get:
 *    tags: [Post]
 *    summary: 게시글 상세 조회
 *    description: 게시글의 상세 데이터를 JSON 형식의 에디터 콘텐츠로 불러온다.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: 게시글의 ID
 *    responses:
 *      200:
 *        description: 게시글 상세 조회 성공
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
 *                  example: "게시글 상세 조회 성공"
 *                data:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: number
 *                      example: 1
 *                    board:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: number
 *                          example: 1
 *                        name:
 *                          type: string
 *                          example: "Javascript"
 *                    title:
 *                      type: string
 *                      example: "게시글의 제목입니다."
 *                    description:
 *                      type: string
 *                      example: "게시글의 설명입니다."
 *                    content:
 *                      type: object
 *                      description: 에디터 JSON 데이터
 *                      example:
 *                        type: doc
 *                        content:
 *                          - type: heading
 *                            attrs:
 *                              level: 2
 *                            content:
 *                              - type: text
 *                                text: "임시 에디터를 작성했습니다."
 *                    created_at:
 *                      type: string
 *                      example: "2025-01-01T00:00:00.07945+00:00"
 *                    updated_at:
 *                      type: string
 *                      example: "2025-02-01T00:00:00.07945+00:00"
 *                    images:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example:
 *                        - "img_1232141412.png"
 *                    thumbnail:
 *                      type: object
 *                      properties:
 *                        img_name:
 *                          type: string
 *                          example: "img_1232141412.png"
 *                        img_url:
 *                          type: string
 *                          example: "https://example.com/img_1232141412.png"
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

/**
 * @swagger
 * /post:
 *  post:
 *    tags: [Post]
 *    summary: 게시글 추가
 *    description: 게시글을 추가한다.
 *    security:
 *      - cookieAuth: []
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - board_id
 *               - title
 *               - thumbnail
 *               - description
 *               - content
 *               - images
 *             properties:
 *               board_id:
 *                 type: number
 *                 description: 게시판 ID
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               thumbnail:
 *                 type: object
 *                 description: 썸네일의 이름과 url이 담긴 객체
 *               description:
 *                 type: string
 *                 description: 게시글의 간단한 설명
 *               content:
 *                 type: object
 *                 description: HTML JSON
 *               images:
 *                 type: array
 *                 description: 게시글에 들어간 이미지 목록
 *           example:
 *             board_id: 1
 *             title: 게시글의 제목입니다
 *             thumbnail:
 *               img_name: img_1232141412.png
 *               img_url: https://example.com/img_1232141412.png
 *             description: 게시글의 설명입니다.
 *             content:
 *               type: doc
 *               content:
 *                 - type: heading
 *                   attrs:
 *                     level: 2
 *                   content:
 *                     - type: text
 *                       text: 임시 에디터를 작성했습니다.
 *             images:
 *               - img_1232141412.png
 *    responses:
 *      200:
 *        description: 게시글 추가 성공
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
 *                  example: "게시글 추가 성공"
 *                data:
 *                  type: object
 *                  properties:
 *                    post_id:
 *                      type: number
 *                      example: 1
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
postRouter.post('/', validateToken, async (req, res) => {
  const { board_id, title, thumbnail, description, content, images } = req.body;
  const { data, error } = await supabase
    .from('post')
    .insert({ board_id, title, thumbnail, description, content, images })
    .select();

  if (error) return fail(res, 'DB 오류', 500);

  success(res, '게시글 추가 성공', { post_id: data[0].id });
});

/**
 * @swagger
 * /post/:id:
 *  put:
 *    tags: [Post]
 *    summary: 게시글 수정
 *    description: 게시글을 수정한다.
 *    security:
 *      - cookieAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: 게시글의 ID
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - board_id
 *               - title
 *               - thumbnail
 *               - description
 *               - content
 *               - images
 *             properties:
 *               board_id:
 *                 type: number
 *                 description: 게시판 ID
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               thumbnail:
 *                 type: object
 *                 description: 썸네일의 이름과 url이 담긴 객체
 *               description:
 *                 type: string
 *                 description: 게시글의 간단한 설명
 *               content:
 *                 type: object
 *                 description: HTML JSON
 *               images:
 *                 type: array
 *                 description: 게시글에 들어간 이미지 목록
 *           example:
 *             board_id: 1
 *             title: 게시글의 제목입니다
 *             thumbnail:
 *               img_name: img_1232141412.png
 *               img_url: https://example.com/img_1232141412.png
 *             description: 게시글의 설명입니다.
 *             content:
 *               type: doc
 *               content:
 *                 - type: heading
 *                   attrs:
 *                     level: 2
 *                   content:
 *                     - type: text
 *                       text: 임시 에디터를 작성했습니다.
 *             images:
 *               - img_1232141412.png
 *    responses:
 *      200:
 *        description: 게시글 수정 성공
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
 *                  example: "게시글 수정 성공"
 *                data:
 *                  type: object
 *                  properties:
 *                    post_id:
 *                      type: number
 *                      example: 1
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
postRouter.put('/:id', validateToken, async (req, res) => {
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

/**
 * @swagger
 * /post/:id:
 *  delete:
 *    tags: [Post]
 *    summary: 게시글 삭제
 *    description: 게시글을 삭제한다.
 *    security:
 *      - cookieAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: 게시글의 ID
 *    responses:
 *      200:
 *        description: 게시글 삭제 성공
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
 *                  example: "게시글 삭제 성공"
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
 *      404:
 *        description: 존재하지 않는 게시글
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
 *                  example: "존재하지 않는 게시글"
 */
postRouter.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params;

  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;

  const { data, error } = await supabase
    .from('post')
    .select('id, board:board_id (id, name), thumbnail, images')
    .eq('id', Number(id))
    .single();

  if (error || !data) return fail(res, '존재하지 않는 게시글', 404);

  if (data.thumbnail || data.images.length !== 0) {
    await axios.delete(`${baseUrl}/img`, {
      data: [
        ...(data.thumbnail ? [data.thumbnail.image_name] : []),
        ...(data.images?.length ? data.images : [])
      ],
      headers: {
        Cookie: req.headers.cookie
      }
    });
  }

  await supabase.from('post').delete().eq('id', Number(id));

  success(res, '게시글 삭제 성공', { board_name: data.board.name });
});

export default postRouter;
