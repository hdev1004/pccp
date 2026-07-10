# PCCP 3급 스터디 웹사이트

친구들과 함께 PCCP(프로그래머스 코딩전문역량인증) 3급을 준비하기 위한 스터디 웹사이트입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Vue 3 (Composition API) + Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **AI** | OpenAI API (gpt-4o-mini) |
| **스케줄러** | node-schedule |
| **인증** | JWT (bcryptjs) |
| **폰트** | Pretendard (본문), D2Coding (코드) |
| **아이콘** | Lucide Vue |

---

## 프로젝트 구조

```
pccp/
├── server/                          # 백엔드
│   ├── index.js                     # Express 서버 진입점
│   ├── .env                         # 환경변수 (직접 생성)
│   ├── .env.example                 # 환경변수 템플릿
│   ├── db/
│   │   ├── database.js              # PostgreSQL 초기화 & 스키마
│   │   └── curriculum.js            # 12주 커리큘럼 시드 데이터
│   ├── routes/
│   │   ├── auth.js                  # 회원가입 / 로그인
│   │   ├── problems.js              # 문제 CRUD / 풀이 제출 / AI 추천
│   │   └── quiz.js                  # 시간복잡도 퀴즈
│   ├── middleware/
│   │   └── auth.js                  # JWT 인증 미들웨어
│   └── scheduler/
│       └── quizGenerator.js         # 퀴즈 자동 생성 (node-schedule)
│
├── client/                          # 프론트엔드
│   ├── .env                         # 환경변수 (직접 생성)
│   ├── .env.example                 # 환경변수 템플릿
│   ├── vite.config.js               # Vite 설정 (포트, 프록시)
│   ├── index.html                   # 진입 HTML (폰트 로드)
│   └── src/
│       ├── main.js                  # Vue 앱 초기화
│       ├── App.vue                  # 루트 컴포넌트
│       ├── style.css                # 글로벌 CSS (토스 디자인)
│       ├── api/index.js             # axios 인스턴스 + 인터셉터
│       ├── router/index.js          # Vue Router 설정
│       ├── stores/auth.js           # Pinia 인증 스토어
│       ├── components/
│       │   ├── Navbar.vue           # 상단 네비게이션
│       │   ├── Select.vue           # 커스텀 드롭다운
│       │   └── CodeBlock.vue        # 코드 하이라이팅 (3 테마)
│       └── views/
│           ├── Login.vue            # 로그인
│           ├── Register.vue         # 회원가입
│           ├── Dashboard.vue        # 메인 대시보드
│           ├── Problems.vue         # 문제 풀이 (커리큘럼 + AI 추천)
│           ├── ProblemDetail.vue     # 문제 상세 + 풀이 제출
│           ├── QuizList.vue         # 퀴즈 목록
│           └── Quiz.vue             # 퀴즈 풀기 + 결과
│
└── .gitignore
```

---

## 설치 및 실행

### 1. 사전 요구사항

- Node.js 18+
- PostgreSQL 서버 (접속 가능한 상태)
- OpenAI API 키

### 2. 서버 설정

```bash
cd server
npm install
```

`.env` 파일 생성 (`.env.example` 참고):

```env
# PostgreSQL 접속 정보
DB_HOST=222.120.20.116
DB_PORT=5432
DB_NAME=postgres
DB_SCHEMA=pccp
DB_USER=your_username
DB_PASSWORD=your_password

# JWT 시크릿 키 (아무 문자열)
JWT_SECRET=your_jwt_secret_key_here

# OpenAI API 키
OPENAI_API_KEY=sk-proj-...

# 서버 포트
PORT=3000
```

서버 실행:

```bash
npm run dev     # 개발 (nodemon)
npm start       # 운영
```

> 서버 최초 시작 시 자동으로:
> - `pccp` 스키마 생성
> - 테이블 5개 생성 (users, problems, submissions, weekly_quizzes, quiz_results)
> - 기본 계정 생성: `admin` / `admin1234`
> - 12주 커리큘럼 24문제 시드

### 3. 클라이언트 설정

```bash
cd client
npm install
```

`.env` 파일 생성 (`.env.example` 참고):

```env
VITE_PORT=5173
VITE_API_URL=http://localhost:3000
```

클라이언트 실행:

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 주요 기능

### 회원가입 / 로그인
- 아이디 + 비밀번호 기반 인증
- JWT 토큰 (7일 유효)
- 기본 계정: `admin` / `admin1234`

### 문제 풀이 (커리큘럼 탭)
- **12주 PCCP 3급 커리큘럼** (주당 2문제, 총 24문제)
- 주차별 아코디언 UI, 토픽 표시
- 프로그래머스 링크 연동
- 풀이 코드 붙여넣기 제출 (Python / JS / Java / C++)
- 풀이 삭제 기능 (본인 것만)
- 메모 기능 (접근법, 시간복잡도, 배운 점 등)
- 제출 현황 대시보드 (누가 풀었는지 확인)

| 주차 | 토픽 |
|------|------|
| 1주차 | 배열 기초 |
| 2주차 | 문자열 다루기 |
| 3주차 | 해시 기초 |
| 4주차 | 스택/큐 입문 |
| 5주차 | 정렬 활용 |
| 6주차 | 완전탐색 |
| 7주차 | 탐욕법 (Greedy) |
| 8주차 | DFS/BFS 입문 |
| 9주차 | 스택/큐 심화 |
| 10주차 | 동적 프로그래밍 입문 |
| 11주차 | 해시/힙 심화 |
| 12주차 | 종합 실전 |

### 문제 풀이 (AI 추천 탭)
- 주제 + 난이도 선택 후 OpenAI가 프로그래머스 문제 3개 추천
- 추천된 문제를 "문제 등록" 버튼으로 바로 등록 가능
- 등록된 AI 추천 문제 목록 확인

### 시간복잡도 퀴즈
- **자동 생성**: node-schedule로 매주 월요일 09:00 자동 생성
- **수동 생성**: "퀴즈 생성" 버튼으로 즉시 생성
- OpenAI가 Python 코드 기반 시간복잡도 4지선다 퀴즈 6문제 생성
- 동일 주차 퀴즈 덮어쓰기 지원
- 모든 사용자 동일한 퀴즈 풀이
- 제출 후 정답/오답 + 해설 확인
- 전체 사용자 점수 랭킹 대시보드

### 코드 블록
- highlight.js 문법 하이라이팅 (Python, JS, Java, C++)
- D2Coding 폰트
- 테마 3종: Dark / Light / Monokai
- 선택한 테마 localStorage 저장

### UI/UX
- 토스 디자인 시스템 기반 (Pretendard 폰트, 라운드 카드, 부드러운 그림자)
- Lucide 아이콘
- 커스텀 드롭다운 (애니메이션 + 체크 아이콘)
- 반응형 레이아웃

---

## API 엔드포인트

### 인증
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |

### 문제
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/problems?source=curriculum&week=1` | 문제 목록 |
| GET | `/api/problems/:id` | 문제 상세 + 풀이 목록 |
| POST | `/api/problems/:id/submit` | 풀이 제출 |
| DELETE | `/api/problems/:id/submit` | 내 풀이 삭제 |
| PATCH | `/api/problems/:id/memo` | 메모 수정 |
| POST | `/api/problems/ai-recommend` | AI 문제 추천 |
| POST | `/api/problems/ai-recommend/add` | AI 추천 문제 등록 |

### 퀴즈
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/quiz` | 퀴즈 목록 |
| GET | `/api/quiz/:id` | 퀴즈 문제 가져오기 |
| POST | `/api/quiz/:id/submit` | 퀴즈 제출 |
| GET | `/api/quiz/:id/dashboard` | 퀴즈 랭킹 |
| POST | `/api/quiz/generate` | 퀴즈 생성 |

---

## DB 스키마 (pccp 스키마)

```sql
-- 사용자
users (id, username, password, nickname, created_at)

-- 문제 (커리큘럼 + AI 추천)
problems (id, title, url, week, topic, source, created_by, created_at)

-- 풀이 제출
submissions (id, problem_id, user_id, code, language, memo, submitted_at)
  UNIQUE(problem_id, user_id)

-- 주간 퀴즈
weekly_quizzes (id, week, questions[JSONB], created_at)
  UNIQUE(week)

-- 퀴즈 결과
quiz_results (id, quiz_id, user_id, answers[JSONB], score, completed_at)
  UNIQUE(quiz_id, user_id)
```

---

## 운영 배포

### 빌드

```bash
cd client
npm run build   # dist/ 폴더 생성
```

### Express에서 정적 파일 서빙 (선택)

`server/index.js`에 아래 추가 시 프론트/백 통합 배포 가능:

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### PM2로 운영

```bash
npm install -g pm2
cd server
pm2 start index.js --name pccp
pm2 save
```

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| DB 연결 실패 | `.env`의 DB_HOST, DB_PORT, DB_USER, DB_PASSWORD 확인 |
| 커리큘럼 안 보임 | DB에 `topic`, `source` 컬럼이 없을 수 있음. 서버 재시작하면 자동 추가 |
| 퀴즈 생성 실패 | `.env`의 `OPENAI_API_KEY` 확인. 유효한 키인지 확인 |
| 프론트 API 연결 실패 | `client/.env`의 `VITE_API_URL`이 서버 주소와 일치하는지 확인 |
| `duplicate key` 에러 | 이제 덮어쓰기로 처리됨. 기존 데이터 삭제: `DELETE FROM weekly_quizzes` |
