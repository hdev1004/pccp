# PCCP 3급 스터디 웹사이트

친구들과 함께 PCCP(프로그래머스 코딩전문역량인증) 3급을 준비하기 위한 스터디 웹사이트입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Vue 3 (Composition API) + Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **AI** | OpenAI API (gpt-4o-mini, SSE 스트리밍) |
| **스케줄러** | node-schedule |
| **인증** | JWT (bcryptjs) |
| **폰트** | Pretendard (본문), D2Coding (코드) |
| **아이콘** | Lucide Vue |
| **코드 하이라이팅** | highlight.js (Catppuccin 테마) |

---

## 프로젝트 구조

```
pccp/
├── server/
│   ├── index.js                     # Express 서버 진입점
│   ├── .env                         # 환경변수 (직접 생성)
│   ├── .env.example                 # 환경변수 템플릿
│   ├── db/
│   │   ├── database.js              # PostgreSQL 초기화 & 스키마
│   │   └── curriculum.js            # 12주 커리큘럼 시드 데이터
│   ├── data/
│   │   └── wiki.js                  # 알고리즘 위키 데이터 (18개 유형)
│   ├── routes/
│   │   ├── auth.js                  # 회원가입 / 로그인
│   │   ├── problems.js              # 문제 CRUD / 풀이 제출 / AI 추천
│   │   ├── quiz.js                  # 시간복잡도 퀴즈
│   │   └── wiki.js                  # 알고리즘 위키 API (SSE 스트리밍)
│   ├── middleware/
│   │   └── auth.js                  # JWT 인증 미들웨어
│   └── scheduler/
│       └── quizGenerator.js         # 퀴즈 자동 생성 (매주 월요일 09:00)
│
├── client/
│   ├── vite.config.js               # Vite 설정 (프록시, SSE 버퍼링 해제)
│   ├── index.html                   # 진입 HTML
│   └── src/
│       ├── main.js                  # Vue 앱 초기화
│       ├── App.vue                  # 루트 컴포넌트
│       ├── style.css                # 글로벌 CSS (토스 디자인 시스템)
│       ├── api/index.js             # axios 인스턴스 + JWT 인터셉터
│       ├── router/index.js          # Vue Router (인증 가드)
│       ├── stores/auth.js           # Pinia 인증 스토어
│       ├── components/
│       │   ├── Navbar.vue           # 상단 네비게이션
│       │   ├── Select.vue           # 커스텀 드롭다운
│       │   ├── CodeBlock.vue        # 코드 하이라이팅 (Dark/Light/Monokai)
│       │   └── WikiSidebar.vue      # 위키 사이드바 목차 (공통)
│       └── views/
│           ├── Login.vue            # 로그인
│           ├── Register.vue         # 회원가입
│           ├── Dashboard.vue        # 메인 대시보드
│           ├── Problems.vue         # 문제 풀이 (커리큘럼 + AI 추천)
│           ├── ProblemDetail.vue     # 문제 상세 + 풀이 제출
│           ├── Wiki.vue             # 알고리즘 위키 목록 + Big-O 차트
│           ├── WikiDetail.vue       # 위키 상세 (개념+코드+AI 스트리밍)
│           ├── QuizList.vue         # 퀴즈 목록 + 생성/삭제
│           └── Quiz.vue             # 퀴즈 풀기 + 결과
│
├── CLAUDE.md                        # AI 개발 컨텍스트 (작업 이력)
└── .gitignore
```

---

## 설치 및 실행

### 1. 사전 요구사항

- Node.js 18+
- PostgreSQL 서버
- OpenAI API 키

### 2. 서버 설정

```bash
cd server
npm install
```

`.env` 파일 생성:

```env
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_SCHEMA=pccp
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=sk-proj-...
PORT=3000
```

```bash
npm run dev     # 개발 (nodemon)
npm start       # 운영
```

> 서버 최초 시작 시 자동으로:
> - `pccp` 스키마 + 테이블 5개 생성
> - 기본 계정: `admin` / `admin1234`
> - 12주 커리큘럼 24문제 시드
> - 소프트 삭제용 `deleted_at` 컬럼 자동 추가

### 3. 클라이언트 설정

```bash
cd client
npm install
```

`.env` 파일 생성:

```env
VITE_PORT=5173
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 주요 기능

### 회원가입 / 로그인
- JWT 토큰 기반 인증 (7일 유효)
- 기본 계정: `admin` / `admin1234`

### 문제 풀이
- **커리큘럼 탭**: 12주 PCCP 3급 커리큘럼 (주당 2문제, 총 24문제)
- **AI 추천 탭**: 주제 + 난이도 선택 → GPT가 프로그래머스 문제 3개 추천
- AI 추천 문제 등록/삭제 가능 (소프트 삭제)
- 풀이 제출 (Python/JS/Java/C++), 메모, 삭제
- 코드 하이라이팅 3테마: Dark(Catppuccin) / Light / Monokai

### 알고리즘 위키
- **18개 알고리즘/자료구조 개념** 정리 (초보자 눈높이, 비유 중심)
- 왼쪽 사이드바 목차 + 오른쪽 본문 레이아웃
- Big-O 복잡도 비교 그래프 (bigocheatsheet.com 스타일)
- 각 개념: 비유 설명 + 시간복잡도 바 차트 + Python 코드 예시 + 참고 이미지
- **AI 질문**: SSE 스트리밍으로 실시간 타이핑 효과 + 해당 개념 특화 답변
- 스켈레톤 UI 로딩

| 카테고리 | 항목 |
|---------|------|
| 기초 개념 | 시간복잡도란? (구하는 방법 포함) |
| 자료구조 | 배열, 문자열, 해시, 스택/큐, 힙, 유니온 파인드, 그래프 기초 |
| 알고리즘 | 정렬, 완전탐색, 탐욕법, DFS/BFS, DP, 이진 탐색, 냅색, 투 포인터/슬라이딩 윈도우, 재귀/백트래킹, 최단 경로(다익스트라), 비트마스킹 |

### 시간복잡도 퀴즈
- 주차 선택 후 GPT가 Python 코드 기반 4지선다 6문제 생성
- 같은 주차 덮어쓰기 (확인 모달)
- 퀴즈 삭제 가능 (확인 모달, 소프트 삭제)
- 매주 월요일 09:00 자동 생성 (node-schedule)
- 점수 랭킹 대시보드

### 데이터 보존 (소프트 삭제)
- 문제/퀴즈 삭제 시 `deleted_at` 타임스탬프만 설정
- 제출 코드(submissions), 퀴즈 결과(quiz_results)는 보존
- 통계/이력 분석에 활용 가능

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
| POST | `/api/problems/:id/submit` | 풀이 제출 (upsert) |
| DELETE | `/api/problems/:id/submit` | 내 풀이 삭제 |
| PATCH | `/api/problems/:id/memo` | 메모 수정 |
| POST | `/api/problems/ai-recommend` | AI 문제 추천 |
| POST | `/api/problems/ai-recommend/add` | AI 추천 문제 등록 |
| DELETE | `/api/problems/:id` | AI 문제 삭제 (소프트) |

### 위키
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/wiki` | 위키 목록 |
| GET | `/api/wiki/:id` | 위키 상세 |
| POST | `/api/wiki/:id/ask` | AI 질문 (SSE 스트리밍) |

### 퀴즈
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/quiz` | 퀴즈 목록 |
| GET | `/api/quiz/:id` | 퀴즈 문제 가져오기 |
| POST | `/api/quiz/:id/submit` | 퀴즈 제출 |
| GET | `/api/quiz/:id/dashboard` | 퀴즈 랭킹 |
| POST | `/api/quiz/generate` | 퀴즈 생성 (body: {week}) |
| DELETE | `/api/quiz/:id` | 퀴즈 삭제 (소프트) |

---

## DB 스키마

```sql
-- 사용자
users (id, username, password, nickname, created_at)

-- 문제 (커리큘럼 + AI 추천)
problems (id, title, url, week, topic, source, created_by, created_at, deleted_at)

-- 풀이 제출
submissions (id, problem_id, user_id, code, language, memo, submitted_at)
  UNIQUE(problem_id, user_id)

-- 주간 퀴즈
weekly_quizzes (id, week, questions[JSONB], created_at, deleted_at)

-- 퀴즈 결과
quiz_results (id, quiz_id, user_id, answers[JSONB], score, completed_at)
  UNIQUE(quiz_id, user_id)
```

> `deleted_at`이 NULL이 아닌 행은 소프트 삭제됨. 목록 조회 시 `WHERE deleted_at IS NULL` 필터 적용.

---

## 운영 배포

### 빌드

```bash
cd client
npm run build   # dist/ 폴더 생성
```

### 통합 배포 (Express 정적 파일 서빙)

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### PM2

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
| DB 연결 실패 | `.env`의 DB 접속 정보 확인 |
| 커리큘럼 안 보임 | 서버 재시작 → 자동으로 누락 컬럼 추가 |
| 퀴즈 생성 실패 | `OPENAI_API_KEY` 유효한지 확인 |
| AI 스트리밍 안 됨 | Vite 프록시 SSE 버퍼링 설정 확인, 서버 재시작 |
| 카드 크기 불균일 | 글로벌 `.card + .card` margin 이슈 → `margin-top: 0 !important` |
