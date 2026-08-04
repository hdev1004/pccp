const express = require('express');
const OpenAI = require('openai');
const { pool } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generateQuiz } = require('../scheduler/quizGenerator');

const router = express.Router();

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// AI 채점: 서술형/단답형 문제 채점 + 피드백
async function gradeWithAI(questions, answers) {
  const toGrade = [];
  questions.forEach((q, idx) => {
    if ((q.type === 'descriptive' || q.type === 'short_answer') && answers[idx] !== undefined) {
      toGrade.push({ index: idx, question: q, userAnswer: answers[idx] });
    }
  });

  if (toGrade.length === 0) return { scores: {}, feedbacks: {} };

  const prompt = `당신은 알고리즘 시간복잡도 시험 채점관입니다.
학생의 답안을 채점하고 피드백을 제공해주세요.

${toGrade.map((item, i) => `
## 문제 ${i + 1} (${item.question.type === 'descriptive' ? '서술형' : '단답형'})

### 코드:
\`\`\`python
${item.question.code}
\`\`\`

${item.question.type === 'descriptive' ? `### 해당 코드의 시간복잡도: ${item.question.complexity}
### 문제: 위 코드의 시간복잡도가 왜 ${item.question.complexity}인지 설명하시오.
### 모범 답안: ${item.question.answer}
### 핵심 키워드: ${(item.question.grading_keywords || []).join(', ')}` : `### 문제: 위 코드의 시간복잡도를 쓰시오.
### 정답: ${item.question.answer}`}

### 학생 답안: ${item.userAnswer || '(미작성)'}
`).join('\n')}

각 문제에 대해 아래 JSON 형식으로 채점 결과를 반환하세요:
{"results": [
  {
    "index": 문제의 원래 인덱스,
    "score": 0 또는 1 (정답이면 1, 오답이면 0, 서술형은 핵심을 잘 설명했으면 1),
    "feedback": "채점 피드백 (잘한 점, 부족한 점, 보완할 내용을 친절하게 설명)"
  }
]}

채점 기준:
- 단답형: 표기법이 정확하면 1점 (O(n), O(n^2), O(n²) 등 동일 의미면 정답 처리). 답이 비어있으면 0점.
- 서술형: 핵심 개념을 이해하고 설명했으면 1점. 부분적으로 맞아도 핵심을 놓쳤으면 0점. 답이 비어있으면 0점.
- 피드백은 틀렸어도 격려하면서 어떻게 생각하면 좋을지 보완점을 알려주세요.`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  const results = parsed.results || [];

  const scores = {};
  const feedbacks = {};
  for (const r of results) {
    scores[r.index] = r.score;
    feedbacks[r.index] = r.feedback;
  }

  return { scores, feedbacks };
}

// 다음 퀴즈 주차 계산 (삭제되지 않은 퀴즈 중 가장 큰 week + 1)
async function getNextWeek() {
  const result = await pool.query('SELECT COALESCE(MAX(week), 0) as max_week FROM weekly_quizzes WHERE deleted_at IS NULL');
  return result.rows[0].max_week + 1;
}

// 수동 퀴즈 생성 (/:id 보다 먼저 선언)
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { week: requestedWeek } = req.body;
    const week = requestedWeek || await getNextWeek();

    // 해당 주차에 이미 퀴즈가 있으면 소프트 삭제 후 재생성 (기존 결과 보존)
    let overwritten = false;
    const existing = await pool.query('SELECT id FROM weekly_quizzes WHERE week = $1 AND deleted_at IS NULL', [week]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE weekly_quizzes SET deleted_at = NOW() WHERE id = $1', [existing.rows[0].id]);
      overwritten = true;
    }

    const quiz = await generateQuiz(week);
    res.status(201).json({ ...quiz, overwritten });
  } catch (err) {
    console.error('퀴즈 생성 오류:', err);
    res.status(500).json({ message: `퀴즈 생성에 실패했습니다: ${err.message}` });
  }
});

// 퀴즈 목록
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wq.id, wq.week, wq.created_at,
        (SELECT COUNT(*) FROM quiz_results qr WHERE qr.quiz_id = wq.id) as participant_count,
        EXISTS(SELECT 1 FROM quiz_results qr WHERE qr.quiz_id = wq.id AND qr.user_id = $1) as completed
       FROM weekly_quizzes wq
       WHERE wq.deleted_at IS NULL
       ORDER BY wq.week DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('퀴즈 목록 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 퀴즈 삭제 — 소프트 삭제 (퀴즈 결과/점수 보존)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE weekly_quizzes SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '퀴즈를 찾을 수 없습니다.' });
    }

    res.json({ message: '퀴즈가 삭제되었습니다.' });
  } catch (err) {
    console.error('퀴즈 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 퀴즈 문제 가져오기 (답 제외)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await pool.query('SELECT * FROM weekly_quizzes WHERE id = $1', [req.params.id]);
    if (quiz.rows.length === 0) {
      return res.status(404).json({ message: '퀴즈를 찾을 수 없습니다.' });
    }

    const existing = await pool.query(
      'SELECT * FROM quiz_results WHERE quiz_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.json({
        ...quiz.rows[0],
        result: existing.rows[0],
        completed: true,
      });
    }

    const questions = quiz.rows[0].questions.map(q => {
      const base = { id: q.id, type: q.type || 'choice', code: q.code };
      if (base.type === 'choice') {
        base.options = q.options;
      } else if (base.type === 'descriptive') {
        base.complexity = q.complexity;
      }
      // short_answer: 코드만 보여줌 (answer 숨김)
      return base;
    });

    res.json({
      id: quiz.rows[0].id,
      week: quiz.rows[0].week,
      questions,
      completed: false,
    });
  } catch (err) {
    console.error('퀴즈 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 퀴즈 제출
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: '답변을 제출해주세요.' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM quiz_results WHERE quiz_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: '이미 제출한 퀴즈입니다.' });
    }

    const quiz = await pool.query('SELECT * FROM weekly_quizzes WHERE id = $1', [req.params.id]);
    if (quiz.rows.length === 0) {
      return res.status(404).json({ message: '퀴즈를 찾을 수 없습니다.' });
    }

    const questions = quiz.rows[0].questions;

    // 4지선다 채점
    let score = 0;
    answers.forEach((answer, index) => {
      const q = questions[index];
      if (!q) return;
      const type = q.type || 'choice';
      if (type === 'choice' && answer === q.answer) {
        score++;
      }
    });

    // 서술형/단답형 AI 채점
    let feedbacks = null;
    const hasTextQuestions = questions.some(q => q.type === 'descriptive' || q.type === 'short_answer');
    if (hasTextQuestions) {
      try {
        const aiResult = await gradeWithAI(questions, answers);
        feedbacks = {};
        for (const [idx, fb] of Object.entries(aiResult.feedbacks)) {
          feedbacks[idx] = fb;
        }
        for (const [idx, s] of Object.entries(aiResult.scores)) {
          score += s;
        }
      } catch (err) {
        console.error('AI 채점 오류:', err);
        // AI 채점 실패 시에도 제출은 진행 (서술형/단답형 0점 처리)
        feedbacks = {};
        questions.forEach((q, idx) => {
          if (q.type === 'descriptive' || q.type === 'short_answer') {
            feedbacks[idx] = 'AI 채점에 실패했습니다. 관리자에게 문의해주세요.';
          }
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO quiz_results (quiz_id, user_id, answers, score, feedbacks)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, req.user.id, JSON.stringify(answers), score, feedbacks ? JSON.stringify(feedbacks) : null]
    );

    res.json({
      result: result.rows[0],
      questions,
      total: questions.length,
    });
  } catch (err) {
    console.error('퀴즈 제출 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 퀴즈 대시보드
router.get('/:id/dashboard', authMiddleware, async (req, res) => {
  try {
    const quiz = await pool.query('SELECT * FROM weekly_quizzes WHERE id = $1', [req.params.id]);
    if (quiz.rows.length === 0) {
      return res.status(404).json({ message: '퀴즈를 찾을 수 없습니다.' });
    }

    const results = await pool.query(
      `SELECT qr.*, u.nickname
       FROM quiz_results qr
       LEFT JOIN users u ON qr.user_id = u.id
       WHERE qr.quiz_id = $1
       ORDER BY qr.score DESC, qr.completed_at ASC`,
      [req.params.id]
    );

    res.json({
      quiz: { id: quiz.rows[0].id, week: quiz.rows[0].week, total: quiz.rows[0].questions.length },
      results: results.rows,
    });
  } catch (err) {
    console.error('대시보드 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
