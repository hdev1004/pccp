const { Pool } = require('pg');
require('dotenv').config();

const schema = process.env.DB_SCHEMA || 'pccp';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await client.query(`ALTER DATABASE ${process.env.DB_NAME} SET search_path TO ${schema}, public`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schema}.problems (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        url TEXT NOT NULL,
        week INTEGER NOT NULL,
        topic VARCHAR(100),
        source VARCHAR(20) DEFAULT 'curriculum',
        created_by INTEGER REFERENCES ${schema}.users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schema}.submissions (
        id SERIAL PRIMARY KEY,
        problem_id INTEGER REFERENCES ${schema}.problems(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES ${schema}.users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        language VARCHAR(20) DEFAULT 'python',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(problem_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS ${schema}.weekly_quizzes (
        id SERIAL PRIMARY KEY,
        week INTEGER UNIQUE NOT NULL,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schema}.quiz_results (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES ${schema}.weekly_quizzes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES ${schema}.users(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(quiz_id, user_id)
      );
    `);

    // 기존 테이블에 누락된 컬럼 추가 (이미 있으면 무시)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE ${schema}.problems ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
        ALTER TABLE ${schema}.problems ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'curriculum';
        ALTER TABLE ${schema}.submissions ADD COLUMN IF NOT EXISTS memo TEXT DEFAULT '';
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // 기본 계정 생성 (admin / admin1234)
    const bcrypt = require('bcryptjs');
    const existing = await client.query(`SELECT id FROM ${schema}.users WHERE username = 'admin'`);
    if (existing.rows.length === 0) {
      const hashedPw = await bcrypt.hash('admin1234', 10);
      await client.query(
        `INSERT INTO ${schema}.users (username, password, nickname) VALUES ('admin', $1, '관리자')`,
        [hashedPw]
      );
      console.log('기본 계정 생성: admin / admin1234');
    }

    // 커리큘럼 시드 (problems 테이블이 비어있을 때만)
    const problemCount = await client.query(`SELECT COUNT(*) FROM ${schema}.problems WHERE source = 'curriculum'`);
    if (parseInt(problemCount.rows[0].count) === 0) {
      const curriculum = require('./curriculum');
      for (const week of curriculum) {
        for (const problem of week.problems) {
          await client.query(
            `INSERT INTO ${schema}.problems (title, url, week, topic, source) VALUES ($1, $2, $3, $4, 'curriculum')`,
            [problem.title, problem.url, week.week, week.topic]
          );
        }
      }
      console.log('12주 커리큘럼 시드 완료 (24문제)');
    }

    console.log(`데이터베이스 초기화 완료 (스키마: ${schema})`);
  } finally {
    client.release();
  }
}

pool.on('connect', (client) => {
  client.query(`SET search_path TO ${schema}, public`);
});

module.exports = { pool, initDatabase };
