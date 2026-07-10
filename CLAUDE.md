# PCCP 스터디 웹사이트 — 개발 컨텍스트

## 프로젝트 개요
PCCP 3급 준비용 스터디 웹사이트. Vue 3 + Express + PostgreSQL + OpenAI.
사용자는 코딩 초보자이며 친구와 함께 사용. 설명은 비유 중심으로 쉽게.

## 기술 스택 & 구조
- **프론트**: Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router, Axios
- **백엔드**: Express, PostgreSQL (pg), JWT (bcryptjs), OpenAI API (gpt-4o-mini)
- **스타일**: 토스 디자인 시스템 기반 커스텀 CSS (Tailwind 미사용), Pretendard 폰트
- **코드 하이라이팅**: highlight.js, D2Coding 폰트, 3테마(Dark/Light/Monokai)
- **아이콘**: Lucide Vue (`@lucide/vue`)
- **DB 스키마명**: `pccp` (환경변수 `DB_SCHEMA`로 설정)

## 주요 아키텍처 패턴

### 인증
- JWT 토큰을 localStorage에 저장 (`stores/auth.js`)
- `api/index.js`에서 axios 인터셉터로 모든 요청에 Bearer 토큰 자동 삽입
- 401 응답 시 자동 로그아웃 + 로그인 페이지 리다이렉트
- 라우터 가드: `meta.auth`는 로그인 필수, `meta.guest`는 비로그인만

### 소프트 삭제
- `problems`, `weekly_quizzes` 테이블에 `deleted_at TIMESTAMP` 컬럼
- 삭제 시 `UPDATE SET deleted_at = NOW()` (실제 DELETE 아님)
- 목록/상세 조회 시 `WHERE deleted_at IS NULL` 필터
- `submissions`, `quiz_results`는 절대 삭제하지 않음 (통계용 보존)
- 커리큘럼 문제는 삭제 불가 (source='curriculum')

### 위키 AI 질문 — SSE 스트리밍
- 서버: OpenAI `stream: true` → `text/event-stream`으로 토큰 단위 전송
- 서버에서 `res.flushHeaders()` + `X-Accel-Buffering: no` 헤더 필수
- Vite 프록시: `vite.config.js`에서 SSE 응답 버퍼링 해제 설정 필요
- 프론트: `fetch` + `ReadableStream`으로 수신 (axios는 스트리밍 미지원이라 fetch 사용)
- 질문 먼저 표시 → 로딩 애니메이션(통통 점) → 실시간 타이핑 → 커서 깜빡임
- AI 프롬프트에 위키 데이터(개념 설명, 복잡도, 코드 예시) 전체를 컨텍스트로 전달

### 위키 마크다운 렌더러
- `WikiDetail.vue`의 `renderMarkdown()` 함수 — 줄 단위 파싱
- 코드블록/테이블을 플레이스홀더로 보호 → 줄 단위로 헤딩/리스트/문단 판별
- 코드블록은 `CodeBlock.vue`와 동일한 `.cb.cb--dark` HTML 구조로 렌더링 (전역 CSS 공유)
- `v-html` 안에서 Vue 컴포넌트 사용 불가 → 직접 HTML 생성 + highlight.js 적용

### 위키 사이드바
- `WikiSidebar.vue` 공통 컴포넌트 → `Wiki.vue`와 `WikiDetail.vue`에서 공유
- `activeId` prop으로 현재 항목 하이라이트
- WikiDetail에서 사이드바 메뉴 클릭 시 `watch(() => route.params.id)`로 데이터 재로드

### 글로벌 CSS 주의사항
- `style.css`에 `.card + .card { margin-top: 16px }` → 그리드 내 카드 크기 불균일 유발
- 그리드 안 카드에는 `margin-top: 0 !important` 오버라이드 필요 (Dashboard, Wiki에 적용됨)

## 파일별 역할

### 서버
| 파일 | 역할 |
|------|------|
| `server/index.js` | Express 앱, 라우트 등록, 서버 시작 |
| `server/db/database.js` | DB 초기화, 스키마/테이블 생성, 시드 데이터, 누락 컬럼 자동 추가 |
| `server/db/curriculum.js` | 12주 커리큘럼 문제 데이터 (title, url, week, topic) |
| `server/data/wiki.js` | 알고리즘 위키 데이터 18개 (id, title, category, content.description/complexities/codeExamples/references) |
| `server/routes/auth.js` | 회원가입(POST register), 로그인(POST login) |
| `server/routes/problems.js` | 문제 CRUD, 풀이 제출(upsert), AI 추천, 소프트 삭제 |
| `server/routes/quiz.js` | 퀴즈 CRUD, 주차 선택 생성, 덮어쓰기, 소프트 삭제 |
| `server/routes/wiki.js` | 위키 목록/상세, AI 질문 (SSE 스트리밍) |
| `server/middleware/auth.js` | JWT 검증 미들웨어 |
| `server/scheduler/quizGenerator.js` | 매주 월요일 09:00 자동 퀴즈 생성 |

### 클라이언트
| 파일 | 역할 |
|------|------|
| `client/vite.config.js` | Vite 설정, API 프록시, SSE 버퍼링 해제 |
| `client/src/style.css` | 글로벌 CSS (토스 컬러, 카드, 버튼, 입력, 뱃지, 모달) |
| `client/src/api/index.js` | axios 인스턴스, JWT 인터셉터, 401 자동 로그아웃 |
| `client/src/router/index.js` | 라우트 정의, 인증 가드 |
| `client/src/stores/auth.js` | Pinia 인증 스토어 (로그인/로그아웃, localStorage 연동) |
| `client/src/components/Navbar.vue` | 상단 네비게이션 (대시보드, 문제풀이, 알고리즘 위키, 퀴즈) |
| `client/src/components/CodeBlock.vue` | 코드 블록 컴포넌트 (3테마, hljs, 전역 CSS) |
| `client/src/components/WikiSidebar.vue` | 위키 사이드바 목차 (카테고리별 항목, activeId 하이라이트) |
| `client/src/components/Select.vue` | 커스텀 드롭다운 |
| `client/src/views/Wiki.vue` | 위키 목록 + Big-O 차트 (SVG, bigocheatsheet.com 스타일) |
| `client/src/views/WikiDetail.vue` | 위키 상세: 마크다운 렌더러, AI 스트리밍 질문, 스켈레톤 UI |
| `client/src/views/Problems.vue` | 문제 풀이: 커리큘럼 아코디언 + AI 추천 + AI 문제 삭제 (모달) |
| `client/src/views/QuizList.vue` | 퀴즈 목록: 주차 선택 생성, 덮어쓰기 확인 모달, 삭제 모달 |

## 위키 데이터 구조 (server/data/wiki.js)

```js
{
  id: 'hash',              // URL 슬러그
  title: '해시 (Hash)',
  category: '자료구조',     // '기초 개념' | '자료구조' | '알고리즘'
  icon: 'hash',            // lucide 아이콘명
  color: '#10b981',
  summary: '한 줄 설명',
  week: 3,                 // 커리큘럼 연결 주차 (null이면 미연결)
  content: {
    references: [{ title, source, url, imageUrl }],  // 참고 이미지 (위키미디어 등)
    description: `마크다운 문자열`,                    // 개념 설명 본문
    complexities: [{ notation, name, description, example, growth }],  // 시간복잡도 바 차트용
    codeExamples: [{ title, language, code }],        // 코드 예시
  }
}
```

현재 18개 항목:
시간복잡도, 배열, 문자열, 해시, 스택/큐, 정렬, 완전탐색, 탐욕법, DFS/BFS, DP, 힙, 이진 탐색, 냅색, 유니온 파인드, 투 포인터/슬라이딩 윈도우, 재귀/백트래킹, 그래프 기초, 최단 경로(다익스트라), 비트마스킹

## 알려진 이슈 & 향후 작업 가능 항목
- 통계/리포트 페이지 (소프트 삭제된 데이터 포함 분석)
- 코드 리뷰 / 풀이 비교 기능
- 퀴즈 오답 노트
- AI 코드 리뷰 (제출 코드 분석)
- 타이머 / 실전 모드
