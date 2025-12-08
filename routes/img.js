import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

import { validateToken } from '../util/validateToken.js';
import { requireEnv } from '../util/requireEnv.js';
import { success, fail } from '../util/response.js';

const imgRouter = express.Router();
const upload = multer({ dest: 'temp/' });

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
  try {
    const ext = path.extname(req.file.originalname);
    const fileName = `img_${Date.now()}${ext}`;
    const tempPath = req.file.path;

    const base64 = (await fs.readFile(tempPath)).toString('base64');
    await fs.unlink(tempPath);

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${fileName}`;

    const imageUrl = await axios
      .put(
        url,
        {
          message: `upload image: ${fileName}`,
          content: base64,
          branch: BRANCH
        },
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`
          }
        }
      )
      .then(res => res.data.content.download_url);

    success(res, '이미지 업로드 성공', {
      img_name: fileName,
      img_url: imageUrl
    });
  } catch {
    fail(res, '이미지 업로드 실패', 500);
  }
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
  try {
    const images = req.body;

    for (const image of images) {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${image}`;

      const shaRes = await axios.get(url + `?ref=${BRANCH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });

      await axios.delete(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        data: {
          message: `delete image: ${image}`,
          sha: shaRes.data.sha,
          branch: BRANCH
        }
      });
    }
    success(res, '이미지 삭제 성공');
  } catch {
    fail(res, '이미지 삭제 실패', 500);
  }
});

export default imgRouter;
