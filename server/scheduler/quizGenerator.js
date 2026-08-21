const OpenAI = require('openai');
const schedule = require('node-schedule');
const { pool } = require('../db/database');

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function generateQuiz(week, groupId = null) {
  const openai = getOpenAI();

  const prompt = `당신은 알고리즘 시간복잡도 퀴즈 출제자입니다.
PCCP(프로그래머스 코딩전문역량인증) 3급 수준의 시간복잡도 퀴즈를 8문제 만들어주세요.

## 문제 구성 (총 8문제)

### A. 4지선다 문제 6개 (type: "choice")
- Python 코드 스니펫을 보여주고, 해당 코드의 시간복잡도를 맞추는 4지선다 문제
- 난이도: 쉬운 것 2개, 중간 2개, 어려운 것 2개
- 알고리즘 패턴(정렬, 탐색, DP, 그래프 등)뿐만 아니라, **일상적으로 자주 사용하는 코드 패턴**도 포함하세요
  - 예: 리스트 슬라이싱, dict/set 연산, list comprehension, sorted(), in 연산, 문자열 연결 등
  - 실무/코테에서 무심코 쓰지만 시간복잡도를 잘 모르는 코드가 좋습니다
- options는 4개, answer는 options 인덱스(0~3)

### B. 단답형 문제 1개 (type: "short_answer")
- Python 코드를 보여주고, 시간복잡도를 직접 작성하게 하는 문제
- 일상적으로 사용하는 코드(리스트 연산, 딕셔너리 조회, 정렬 등) 또는 알고리즘 코드
- answer에 정답 복잡도를 적어주세요 (예: "O(n log n)")
- explanation에 해설을 적어주세요

### C. 서술형 문제 1개 (type: "descriptive")
- Python 코드와 해당 코드의 시간복잡도를 함께 보여주고, **왜 그 시간복잡도가 되는지** 설명하게 하는 문제
- complexity 필드에 해당 코드의 시간복잡도를 적어주세요
- answer에 모범 답안(왜 그 복잡도인지 설명)을 적어주세요
- 핵심 키워드(grading_keywords)를 3~5개 제시하세요 (채점 참고용)

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"questions": [
  {
    "id": 1,
    "type": "choice",
    "code": "코드 내용",
    "options": ["O(1)", "O(n)", "O(n²)", "O(n log n)"],
    "answer": 0,
    "explanation": "해설"
  },
  {
    "id": 7,
    "type": "short_answer",
    "code": "코드 내용",
    "answer": "O(n)",
    "explanation": "해설"
  },
  {
    "id": 8,
    "type": "descriptive",
    "code": "코드 내용",
    "complexity": "O(n²)",
    "answer": "모범 답안 (왜 이 복잡도인지 설명)",
    "grading_keywords": ["중첩 반복문", "n번 반복", "내부 루프"],
    "explanation": "해설"
  }
]}

answer는 options 배열의 인덱스(0부터)입니다.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error('AI 응답을 파싱할 수 없습니다: ' + raw.substring(0, 200));
  }

  let questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || parsed.data);

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('AI가 유효한 퀴즈를 생성하지 못했습니다.');
  }

  // id 재할당
  questions = questions.map((q, i) => ({ ...q, id: i + 1 }));

  const result = await pool.query(
    'INSERT INTO weekly_quizzes (week, questions, group_id) VALUES ($1, $2, $3) RETURNING *',
    [week, JSON.stringify(questions), groupId]
  );

  console.log(`${week}주차 퀴즈 생성 완료 (${questions.length}문제)`);
  return result.rows[0];
}

function startScheduler() {
  schedule.scheduleJob('0 9 * * 1', async () => {
    try {
      // 모든 그룹에 대해 퀴즈 생성
      const groups = await pool.query('SELECT id FROM groups');
      for (const group of groups.rows) {
        const result = await pool.query(
          'SELECT COALESCE(MAX(week), 0) as max_week FROM weekly_quizzes WHERE group_id = $1',
          [group.id]
        );
        const week = result.rows[0].max_week + 1;
        await generateQuiz(week, group.id);
      }
    } catch (err) {
      console.error('스케줄 퀴즈 생성 실패:', err);
    }
  });

  console.log('퀴즈 자동 생성 스케줄러 시작 (매주 월요일 09:00)');
}

module.exports = { generateQuiz, startScheduler };
