const express = require('express');
const { pool } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generateQuiz } = require('../scheduler/quizGenerator');

const router = express.Router();

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

    const questions = quiz.rows[0].questions.map(q => ({
      id: q.id,
      code: q.code,
      options: q.options,
    }));

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
    let score = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].answer) {
        score++;
      }
    });

    const result = await pool.query(
      `INSERT INTO quiz_results (quiz_id, user_id, answers, score)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, JSON.stringify(answers), score]
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
