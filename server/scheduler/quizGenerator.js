const OpenAI = require('openai');
const schedule = require('node-schedule');
const { pool } = require('../db/database');

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function generateQuiz(week) {
  const openai = getOpenAI();

  const prompt = `당신은 알고리즘 시간복잡도 퀴즈 출제자입니다.
PCCP(프로그래머스 코딩전문역량인증) 3급 수준의 시간복잡도 퀴즈를 6문제 만들어주세요.

규칙:
1. 각 문제는 Python 코드 스니펫을 보여주고, 해당 코드의 시간복잡도를 맞추는 4지선다 문제입니다.
2. 난이도를 다양하게 섞어주세요 (쉬운 것 2개, 중간 2개, 어려운 것 2개).
3. 코드는 실제 알고리즘 문제에서 나올 법한 패턴을 사용하세요 (정렬, 탐색, DP, 그래프 등).
4. 각 문제에 정답과 해설을 포함해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"questions": [
  {
    "id": 1,
    "code": "코드 내용",
    "options": ["O(1)", "O(n)", "O(n²)", "O(n log n)"],
    "answer": 0,
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
    'INSERT INTO weekly_quizzes (week, questions) VALUES ($1, $2) RETURNING *',
    [week, JSON.stringify(questions)]
  );

  console.log(`${week}주차 퀴즈 생성 완료 (${questions.length}문제)`);
  return result.rows[0];
}

function startScheduler() {
  schedule.scheduleJob('0 9 * * 1', async () => {
    try {
      const result = await pool.query('SELECT COALESCE(MAX(week), 0) as max_week FROM weekly_quizzes');
      const week = result.rows[0].max_week + 1;
      await generateQuiz(week);
    } catch (err) {
      console.error('스케줄 퀴즈 생성 실패:', err);
    }
  });

  console.log('퀴즈 자동 생성 스케줄러 시작 (매주 월요일 09:00)');
}

module.exports = { generateQuiz, startScheduler };
