# 🖥️ GGDevLog [서버]
> **개인 개발 블로그 Express API 백엔드 서버**

![Node.js](https://img.shields.io/badge/Node.js-16.x-green) 
![Express](https://img.shields.io/badge/Express.js-5.x-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 📌 프로젝트 소개
이 프로젝트는 🖥️ **[GGDevLog](https://github.com/ogg1996/ggdevlog)** 웹 서비스를 위한 백엔드 API 서버입니다.

프론트엔드와 분리된 구조로 API 역할에 집중하도록 설계되었습니다.

### 🚀 주요 기능

#### 🔐 인증 / 보안
- JWT 기반 관리자 인증을 통한 POST·PUT·DELETE 요청 제한
- HttpOnly Cookie 기반 토큰 관리
- 로그인 요청 제한 (Rate Limit)
- helmet을 통한 기본 보안 헤더 설정

#### 📝 게시판 / 게시글
- 게시판 · 게시글 CRUD
- 게시판별 게시글 조회 (페이지네이션 지원)

#### 🖼 이미지 관리
- 게시글 이미지 업로드 및 삭제

#### 📦 기타
- Supabase 기반 데이터 CRUD

### 🛠 사용 기술

#### Core
- Node.js
- Express.js

#### Database / Storage
- Supabase (PostgreSQL)

#### Auth / Security
- JWT
- bcrypt
- cookie-parser
- helmet
- express-rate-limit

#### File / Image Handling
- multer

#### API Docs
- swagger-jsdoc
- swagger-ui-express

#### Utils / Infra
- CORS
- dotenv
- path

## 📘 API 문서
본 프로젝트는 Swagger를 사용하여 API 문서를 제공합니다.

각 엔드포인트의 요청 · 응답 형식과 인증 여부를 확인할 수 있습니다.

👉 [`API Docs`](https://similar-estel-ohgeonguk-6c8de0a7.koyeb.app/api-docs)

## 🚧 실행 환경 및 제약 사항
본 서버는 제작자의 Supabase(PostgreSQL) 및 외부 스토리지와 직접 연동되는 구조로 설계되어,
로컬 환경에서 단독 실행을 위한 환경은 제공하지 않습니다.

- 외부 DB 및 스토리지 의존
- 환경 변수 기반 보안 정보 관리

API 동작 구조와 설계 방식은 Swagger 문서를 통해 확인할 수 있습니다.

