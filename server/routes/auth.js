const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function generateInviteCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// 회원가입
router.post('/register', async (req, res) => {
  const { username, password, nickname, inviteCode } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 초대코드가 있으면 그룹 찾기
    let groupId = null;
    if (inviteCode) {
      const group = await pool.query('SELECT id FROM groups WHERE invite_code = $1', [inviteCode.toUpperCase()]);
      if (group.rows.length === 0) {
        return res.status(400).json({ message: '유효하지 않은 초대코드입니다.' });
      }
      groupId = group.rows[0].id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, nickname, group_id) VALUES ($1, $2, $3, $4) RETURNING id, username, nickname, group_id',
      [username, hashedPassword, nickname, groupId]
    );

    res.status(201).json({ message: '회원가입 성공', user: result.rows[0] });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname, group_id: user.group_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, group_id: user.group_id },
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 그룹 정보 + 멤버 목록
router.get('/group', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT group_id FROM users WHERE id = $1', [req.user.id]);
    const groupId = user.rows[0]?.group_id;

    if (!groupId) {
      return res.json({ group: null, members: [] });
    }

    const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    const members = await pool.query(
      'SELECT id, nickname, username, created_at FROM users WHERE group_id = $1 ORDER BY created_at ASC',
      [groupId]
    );

    res.json({ group: group.rows[0], members: members.rows });
  } catch (err) {
    console.error('그룹 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 그룹 생성
router.post('/group', authMiddleware, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: '그룹 이름을 입력해주세요.' });
  }

  try {
    const user = await pool.query('SELECT group_id, username FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0]?.username === 'tester') {
      return res.status(403).json({ message: '샘플 계정은 그룹을 생성할 수 없습니다.' });
    }
    if (user.rows[0]?.group_id) {
      return res.status(400).json({ message: '이미 그룹에 소속되어 있습니다. 먼저 그룹을 나가주세요.' });
    }

    const inviteCode = generateInviteCode();
    const group = await pool.query(
      'INSERT INTO groups (name, invite_code) VALUES ($1, $2) RETURNING *',
      [name, inviteCode]
    );

    await pool.query('UPDATE users SET group_id = $1 WHERE id = $2', [group.rows[0].id, req.user.id]);

    res.status(201).json(group.rows[0]);
  } catch (err) {
    console.error('그룹 생성 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 초대코드로 그룹 참여
router.post('/group/join', authMiddleware, async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({ message: '초대코드를 입력해주세요.' });
  }

  try {
    const user = await pool.query('SELECT group_id, username FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0]?.username === 'tester') {
      return res.status(403).json({ message: '샘플 계정은 그룹에 참여할 수 없습니다.' });
    }
    if (user.rows[0]?.group_id) {
      return res.status(400).json({ message: '이미 그룹에 소속되어 있습니다. 먼저 그룹을 나가주세요.' });
    }

    const group = await pool.query('SELECT * FROM groups WHERE invite_code = $1', [inviteCode.toUpperCase()]);
    if (group.rows.length === 0) {
      return res.status(404).json({ message: '유효하지 않은 초대코드입니다.' });
    }

    await pool.query('UPDATE users SET group_id = $1 WHERE id = $2', [group.rows[0].id, req.user.id]);

    res.json({ message: '그룹에 참여했습니다.', group: group.rows[0] });
  } catch (err) {
    console.error('그룹 참여 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 그룹 나가기
router.post('/group/leave', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET group_id = NULL WHERE id = $1', [req.user.id]);
    res.json({ message: '그룹에서 나왔습니다.' });
  } catch (err) {
    console.error('그룹 나가기 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
