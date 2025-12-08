import express from 'express';
import multer from 'multer';
import path from 'path';
import supabase from '../supabase/client.js';

import { validateToken } from '../util/validateToken.js';
import { requireEnv } from '../util/requireEnv.js';
import { success, fail } from '../util/response.js';

const imgRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_TOKEN = requireEnv('GITHUB_API_TOKEN');
const OWNER = 'ogg1996';
const REPO = 'ggdevlog-img-uploads';
const BRANCH = 'main';

/**
 * @swagger
 * tags:
 *  - name: Img
 *    description: 이미지 관련 API
 */

/**
 * @swagger
 * /img:
 *  post:
 *    tags: [Img]
 *    summary: 이미지 업로드
 *    description: 저장소에 이미지를 업로드한다.
 *    security:
 *      - cookieAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              img:
 *                description: 이미지 파일
 *            required:
 *              - img
 *    responses:
 *      200:
 *        description: 이미지 업로드 성공
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
 *                  example: "이미지 업로드 성공"
 *                data:
 *                  type: object
 *                  properties:
 *                    img_name:
 *                      type: string
 *                      example: "img_1232141412.png"
 *                    img_url:
 *                      type: string
 *                      example: "https://example.com/img_1232141412.png"
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
 *        description: 이미지 업로드 실패
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
 *                  example: "이미지 업로드 실패"
 */
imgRouter.post('/', validateToken, upload.single('img'), async (req, res) => {
  const ext = path.extname(req.file.originalname);
  const fileName = `img_${Date.now()}${ext}`;
  const filePath = `images/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype
    });

  if (error) return fail(res, '이미지 업로드 실패', 500);

  const { data } = await supabase.storage.from('images').getPublicUrl(filePath);

  success(res, '이미지 업로드 성공', {
    img_name: fileName,
    img_url: data.publicUrl
  });
});

/**
 * @swagger
 * /img:
 *  delete:
 *    tags: [Img]
 *    summary: 이미지 삭제
 *    description: 저장소에서 이미지를 삭제한다.
 *    security:
 *      - cookieAuth: []
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 description: 삭제할 이미지 목록
 *           example:
 *             images: ["img_1232141412.png"]
 *    responses:
 *      200:
 *        description: 이미지 삭제 성공
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
 *                  example: "이미지 삭제 성공"
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
 *        description: 이미지 삭제 실패
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
 *                  example: "이미지 삭제 실패"
 */
imgRouter.delete('/', validateToken, async (req, res) => {
  const images = req.body;

  const filesToDelete = images.map(image => `images/${image}`);

  const { error } = await supabase.storage.from('images').remove(filesToDelete);

  if (error) return fail(res, '이미지 삭제 실패', 500);

  success(res, '이미지 삭제 성공');
});

export default imgRouter;
