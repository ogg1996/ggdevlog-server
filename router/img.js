import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

import { requireEnv } from '../util/validateEnv.js';
import { success, fail } from '../util/response.js';

const imgRouter = express.Router();
const upload = multer({ dest: 'temp/' });

const GITHUB_TOKEN = requireEnv('GITHUB_API_TOKEN');
const OWNER = 'ogg1996';
const REPO = 'ggdevlog-img-uploads';
const BRANCH = 'main';

// 이미지 업로드
imgRouter.post('/', upload.single('img'), async (req, res) => {
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

// 이미지 삭제
imgRouter.delete('/', async (req, res) => {
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
