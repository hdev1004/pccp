const express = require('express');
const OpenAI = require('openai');
const { pool } = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 문제 목록 (주차별, source별)
router.get('/', authMiddleware, async (req, res) => {
  const { week, source } = req.query;

  try {
    let query = `
      SELECT p.*, u.nickname as created_by_nickname,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id) as submission_count
      FROM problems p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];
    let idx = 1;

    if (week) {
      query += ` AND p.week = $${idx++}`;
      params.push(week);
    }

    if (source) {
      query += ` AND p.source = $${idx++}`;
      params.push(source);
    }

    query += ' ORDER BY p.week ASC, p.id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('문제 목록 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 주차/토픽 목록
router.get('/weeks/list', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT week, topic, source FROM problems ORDER BY week ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('주차 목록 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// AI 문제 추천
router.post('/ai-recommend', authMiddleware, async (req, res) => {
  const { topic, difficulty } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: 'OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `프로그래머스(programmers.co.kr)에서 풀 수 있는 알고리즘 문제를 3개 추천해주세요.

조건:
- 주제: ${topic || 'PCCP 3급 수준 전반'}
- 난이도: ${difficulty || '레벨 2~3'}
- 실제 프로그래머스에 존재하는 문제만 추천
- 각 문제에 대해 왜 이 문제를 추천하는지 간단한 이유 포함

반드시 아래 JSON 형식으로만 응답하세요:
{"recommendations": [
  {
    "title": "문제 제목",
    "url": "https://school.programmers.co.kr/learn/courses/30/lessons/문제번호",
    "difficulty": "Level 2",
    "topic": "알고리즘 유형",
    "reason": "추천 이유"
  }
]}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    const recommendations = parsed.recommendations || parsed.problems || [];

    res.json(recommendations);
  } catch (err) {
    console.error('AI 추천 오류:', err);
    res.status(500).json({ message: `AI 추천에 실패했습니다: ${err.message}` });
  }
});

// AI 추천 문제를 실제 문제로 등록
router.post('/ai-recommend/add', authMiddleware, async (req, res) => {
  const { title, url, topic } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: '제목과 URL이 필요합니다.' });
  }

  try {
    // AI 추천 문제는 week 0으로 저장
    const result = await pool.query(
      `INSERT INTO problems (title, url, week, topic, source, created_by)
       VALUES ($1, $2, 0, $3, 'ai', $4) RETURNING *`,
      [title, url, topic || 'AI 추천', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('AI 문제 등록 오류:', err);
    res.status(500).json({ message: '문제 등록에 실패했습니다.' });
  }
});

// 문제 상세 (풀이 포함)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const problem = await pool.query(
      `SELECT p.*, u.nickname as created_by_nickname
       FROM problems p LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (problem.rows.length === 0) {
      return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
    }

    const submissions = await pool.query(
      `SELECT s.*, u.nickname
       FROM submissions s LEFT JOIN users u ON s.user_id = u.id
       WHERE s.problem_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );

    res.json({ ...problem.rows[0], submissions: submissions.rows });
  } catch (err) {
    console.error('문제 상세 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 풀이 제출
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { code, language, memo } = req.body;

  if (!code) {
    return res.status(400).json({ message: '코드를 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO submissions (problem_id, user_id, code, language, memo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (problem_id, user_id)
       DO UPDATE SET code = $3, language = $4, memo = $5, submitted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.id, req.user.id, code, language || 'python', memo || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('풀이 제출 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 메모 수정
router.patch('/:id/memo', authMiddleware, async (req, res) => {
  const { memo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE submissions SET memo = $1
       WHERE problem_id = $2 AND user_id = $3 RETURNING *`,
      [memo || '', req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '제출한 풀이가 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('메모 수정 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// AI 코드 리뷰 (SSE 스트리밍)
router.post('/:id/review', authMiddleware, async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ message: '코드가 필요합니다.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: 'OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    // 문제 정보 가져오기
    const problem = await pool.query('SELECT title, topic, week FROM problems WHERE id = $1', [req.params.id]);
    const info = problem.rows[0] || {};

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `당신은 코딩 테스트 전문 리뷰어입니다. 초보자도 이해할 수 있게 친절하게 리뷰해주세요.

## 문제 정보
- 제목: ${info.title || '알 수 없음'}
- 유형: ${info.topic || '알 수 없음'}
- 언어: ${language || 'python'}

## 제출된 코드
\`\`\`${language || 'python'}
${code}
\`\`\`

## 리뷰 항목 (아래 순서대로 답변)
### 1. 시간복잡도 분석
- 이 코드의 시간복잡도를 Big-O로 분석해주세요
- 왜 그런 복잡도인지 핵심 반복문/재귀를 짚어 설명

### 2. 잘한 점
- 코드에서 좋은 부분을 1~2가지 언급

### 3. 개선 포인트
- 더 효율적으로 바꿀 수 있는 부분이 있다면 구체적으로 제안
- 가독성, 변수명, 코드 스타일 개선점

### 4. 한 줄 총평
- 전체적인 평가를 한 줄로

답변 규칙:
- 한국어로 답변
- 마크다운 형식
- 초보자 눈높이로 비유를 들어 설명
- 코드 예시가 필요하면 포함`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    });

    let fullReview = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullReview += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 리뷰 결과를 DB에 저장
    if (fullReview) {
      await pool.query(
        'UPDATE submissions SET review = $1 WHERE problem_id = $2 AND user_id = $3',
        [fullReview, req.params.id, req.user.id]
      );
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI 코드 리뷰 오류:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: `AI 리뷰에 실패했습니다: ${err.message}` });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// 내 풀이 삭제
router.delete('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM submissions WHERE problem_id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '삭제할 풀이가 없습니다.' });
    }

    res.json({ message: '풀이가 삭제되었습니다.' });
  } catch (err) {
    console.error('풀이 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// AI 추천 문제 삭제 — 소프트 삭제 (제출 코드 보존)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const problem = await pool.query('SELECT * FROM problems WHERE id = $1 AND deleted_at IS NULL', [req.params.id]);
    if (problem.rows.length === 0) {
      return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
    }

    if (problem.rows[0].source === 'curriculum') {
      return res.status(403).json({ message: '커리큘럼 문제는 삭제할 수 없습니다.' });
    }

    // 소프트 삭제 — submissions(제출 코드)는 그대로 보존
    await pool.query('UPDATE problems SET deleted_at = NOW() WHERE id = $1', [req.params.id]);

    res.json({ message: '문제가 삭제되었습니다.' });
  } catch (err) {
    console.error('문제 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
