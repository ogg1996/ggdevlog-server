import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const imgRouter = express.Router();

const upload = multer({ dest: 'temp/' });

const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
const OWNER = 'ogg1996';
const REPO = 'ggdevlog-img-uploads';
const BRANCH = 'main';

// 이미지 업로드
imgRouter.post('/', upload.single('img'), async (req, res) => {
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
  } catch {
    res.status(500).json({ message: '업로드 실패' });
  }
});

// 이미지 삭제
imgRouter.delete('/', async (req, res) => {
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
  } catch {
    res.status(500).json({ message: '삭제 실패' });
  }
});

export default imgRouter;
