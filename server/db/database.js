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
      CREATE TABLE IF NOT EXISTS ${schema}.groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        invite_code VARCHAR(10) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schema}.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        group_id INTEGER REFERENCES ${schema}.groups(id) DEFAULT NULL,
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
        ALTER TABLE ${schema}.submissions ADD COLUMN IF NOT EXISTS review TEXT DEFAULT NULL;
        -- 소프트 삭제용 컬럼
        ALTER TABLE ${schema}.problems ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
        ALTER TABLE ${schema}.weekly_quizzes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
        -- AI 채점 피드백 저장
        ALTER TABLE ${schema}.quiz_results ADD COLUMN IF NOT EXISTS feedbacks JSONB DEFAULT NULL;
        -- 그룹 기반 데이터 격리 (기존 DB 마이그레이션용)
        ALTER TABLE ${schema}.users ADD COLUMN IF NOT EXISTS group_id INTEGER DEFAULT NULL;
        ALTER TABLE ${schema}.weekly_quizzes ADD COLUMN IF NOT EXISTS group_id INTEGER DEFAULT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // 소프트 삭제 대응: week UNIQUE 제약조건을 partial unique index로 교체
    // (deleted_at IS NULL인 행만 week 중복 검사)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE ${schema}.weekly_quizzes DROP CONSTRAINT IF EXISTS weekly_quizzes_week_key;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);
    // 그룹별 주차 유니크 (같은 그룹 내에서 week 중복 방지)
    await client.query(`
      DROP INDEX IF EXISTS ${schema}.weekly_quizzes_week_active_idx;
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS weekly_quizzes_week_group_active_idx
      ON ${schema}.weekly_quizzes (week, COALESCE(group_id, 0)) WHERE deleted_at IS NULL;
    `);

    // 기본 그룹 생성
    const groupExists = await client.query(`SELECT id FROM ${schema}.groups WHERE id = 1`);
    if (groupExists.rows.length === 0) {
      await client.query(
        `INSERT INTO ${schema}.groups (id, name, invite_code) VALUES (1, 'PCCP 스터디', 'PCCP24')`
      );
      console.log('기본 그룹 생성: PCCP 스터디 (초대코드: PCCP24)');
    }

    // 기존 퀴즈에 group_id 부여 (마이그레이션 — 충돌 없는 것만)
    await client.query(
      `UPDATE ${schema}.weekly_quizzes wq SET group_id = 1
       WHERE wq.group_id IS NULL AND wq.deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM ${schema}.weekly_quizzes wq2
         WHERE wq2.week = wq.week AND wq2.group_id = 1 AND wq2.deleted_at IS NULL
       )`
    );

    // 기본 계정 생성 (admin / admin1234) — group_id=1 (스터디 그룹)
    const bcrypt = require('bcryptjs');
    const existing = await client.query(`SELECT id FROM ${schema}.users WHERE username = 'admin'`);
    if (existing.rows.length === 0) {
      const hashedPw = await bcrypt.hash('admin1234', 10);
      await client.query(
        `INSERT INTO ${schema}.users (username, password, nickname, group_id) VALUES ('admin', $1, '관리자', 1)`,
        [hashedPw]
      );
      console.log('기본 계정 생성: admin / admin1234 (그룹 1)');
    } else {
      // 기존 계정에 group_id 부여 (마이그레이션)
      await client.query(`UPDATE ${schema}.users SET group_id = 1 WHERE username = 'admin' AND group_id IS NULL`);
    }

    // 기존 유저들 중 group_id 없는 일반 계정에 그룹 1 부여 (admin, tester 제외한 기존 유저)
    await client.query(
      `UPDATE ${schema}.users SET group_id = 1 WHERE group_id IS NULL AND username NOT IN ('tester')`
    );

    // 테스터 계정 생성 (tester / tester1234) — group_id=NULL (격리)
    const testerExisting = await client.query(`SELECT id FROM ${schema}.users WHERE username = 'tester'`);
    if (testerExisting.rows.length === 0) {
      const testerPw = await bcrypt.hash('tester1234', 10);
      await client.query(
        `INSERT INTO ${schema}.users (username, password, nickname, group_id) VALUES ('tester', $1, '테스터', NULL)`,
        [testerPw]
      );
      console.log('테스터 계정 생성: tester / tester1234 (그룹 없음)');
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

    // 테스터 샘플 데이터 시드
    const testerUser = await client.query(`SELECT id FROM ${schema}.users WHERE username = 'tester'`);
    if (testerUser.rows.length > 0) {
      const testerId = testerUser.rows[0].id;
      const hasSample = await client.query(
        `SELECT COUNT(*) FROM ${schema}.submissions WHERE user_id = $1`, [testerId]
      );

      if (parseInt(hasSample.rows[0].count) === 0) {
        // 커리큘럼 문제 중 일부에 샘플 풀이 제출
        const sampleProblems = await client.query(
          `SELECT id, title, week FROM ${schema}.problems WHERE source = 'curriculum' ORDER BY week ASC LIMIT 8`
        );

        const sampleCodes = [
          { lang: 'python', code: `def solution(numbers):\n    answer = set()\n    for i in range(len(numbers)):\n        for j in range(i+1, len(numbers)):\n            answer.add(numbers[i] + numbers[j])\n    return sorted(answer)`, memo: '이중 for문으로 모든 조합을 구한 뒤 set으로 중복 제거' },
          { lang: 'python', code: `def solution(array, commands):\n    answer = []\n    for command in commands:\n        i, j, k = command\n        answer.append(sorted(array[i-1:j])[k-1])\n    return answer`, memo: '슬라이싱 + 정렬로 간단하게 풀이' },
          { lang: 'python', code: `def solution(strings, n):\n    return sorted(strings, key=lambda x: (x[n], x))`, memo: 'lambda로 n번째 문자 기준 정렬, 같으면 사전순' },
          { lang: 'python', code: `def solution(s, n):\n    result = ''\n    for c in s:\n        if c.isupper():\n            result += chr((ord(c) - ord('A') + n) % 26 + ord('A'))\n        elif c.islower():\n            result += chr((ord(c) - ord('a') + n) % 26 + ord('a'))\n        else:\n            result += c\n    return result`, memo: 'ASCII 코드로 밀어서 변환, 대소문자 구분 처리' },
          { lang: 'python', code: `def solution(participant, completion):\n    from collections import Counter\n    p = Counter(participant)\n    c = Counter(completion)\n    return list((p - c).keys())[0]`, memo: 'Counter로 빈도수 차이 계산 — 해시 활용' },
          { lang: 'python', code: `def solution(nums):\n    return min(len(set(nums)), len(nums) // 2)`, memo: 'set 길이와 n/2 중 작은 값이 정답' },
          { lang: 'python', code: `def solution(progresses, speeds):\n    import math\n    days = [math.ceil((100 - p) / s) for p, s in zip(progresses, speeds)]\n    answer = []\n    front = days[0]\n    count = 1\n    for i in range(1, len(days)):\n        if days[i] <= front:\n            count += 1\n        else:\n            answer.append(count)\n            front = days[i]\n            count = 1\n    answer.append(count)\n    return answer`, memo: '각 기능의 완료일 계산 후 앞에서부터 묶기' },
          { lang: 'python', code: `def solution(prices):\n    n = len(prices)\n    answer = [0] * n\n    stack = []\n    for i in range(n):\n        while stack and prices[stack[-1]] > prices[i]:\n            j = stack.pop()\n            answer[j] = i - j\n        stack.append(i)\n    while stack:\n        j = stack.pop()\n        answer[j] = n - 1 - j\n    return answer`, memo: '스택으로 가격이 떨어지는 시점을 O(n)에 계산' },
        ];

        for (let i = 0; i < sampleProblems.rows.length && i < sampleCodes.length; i++) {
          const p = sampleProblems.rows[i];
          const s = sampleCodes[i];
          await client.query(
            `INSERT INTO ${schema}.submissions (problem_id, user_id, code, language, memo)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (problem_id, user_id) DO NOTHING`,
            [p.id, testerId, s.code, s.lang, s.memo]
          );
        }

        // AI 추천 문제 샘플 2개
        await client.query(
          `INSERT INTO ${schema}.problems (title, url, week, topic, source, created_by)
           VALUES ('타겟 넘버', 'https://school.programmers.co.kr/learn/courses/30/lessons/43165', 0, 'DFS/BFS', 'ai', $1),
                  ('피로도', 'https://school.programmers.co.kr/learn/courses/30/lessons/87946', 0, '완전탐색', 'ai', $1)`,
          [testerId]
        );

        console.log('테스터 샘플 데이터 시드 완료 (풀이 8개, AI문제 2개)');
      }

      // 샘플 퀴즈 1주차 (group_id=NULL, tester 전용) — 별도 체크
      const hasQuiz = await client.query(
        `SELECT COUNT(*) FROM ${schema}.weekly_quizzes WHERE group_id IS NULL AND week = 1 AND deleted_at IS NULL`
      );
      if (parseInt(hasQuiz.rows[0].count) === 0) {
        const sampleQuestions = [
          {
            id: 1, type: 'choice',
            code: 'def find(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1',
            options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
            answer: 1,
            explanation: '배열을 처음부터 끝까지 순회하므로 O(n)입니다.'
          },
          {
            id: 2, type: 'choice',
            code: 'def check(arr):\n    return arr[0] + arr[-1]',
            options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
            answer: 0,
            explanation: '인덱스로 직접 접근하므로 O(1)입니다.'
          },
          {
            id: 3, type: 'choice',
            code: 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n-1-i):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]',
            options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
            answer: 2,
            explanation: '이중 반복문이 n번씩 도므로 O(n²)입니다.'
          },
          {
            id: 4, type: 'choice',
            code: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr)-1\n    while lo <= hi:\n        mid = (lo+hi)//2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid+1\n        else: hi = mid-1\n    return -1',
            options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
            answer: 3,
            explanation: '매번 탐색 범위가 절반으로 줄어들므로 O(log n)입니다.'
          },
          {
            id: 5, type: 'choice',
            code: 'def has_dup(arr):\n    return len(arr) != len(set(arr))',
            options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
            answer: 1,
            explanation: 'set 변환이 O(n), len 비교가 O(1)이므로 전체 O(n)입니다.'
          },
          {
            id: 6, type: 'choice',
            code: 'arr = [1,2,3,4,5]\nresult = sorted(arr)',
            options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
            answer: 3,
            explanation: 'Python의 sorted()는 Timsort를 사용하며 O(n log n)입니다.'
          },
          {
            id: 7, type: 'short_answer',
            code: 'def count(arr):\n    freq = {}\n    for x in arr:\n        freq[x] = freq.get(x, 0) + 1\n    return freq',
            answer: 'O(n)',
            explanation: '배열을 한 번 순회하며 딕셔너리에 삽입(O(1))하므로 O(n)입니다.'
          },
          {
            id: 8, type: 'descriptive',
            code: 'def two_sum(arr, target):\n    seen = set()\n    for x in arr:\n        if target - x in seen:\n            return True\n        seen.add(x)\n    return False',
            complexity: 'O(n)',
            answer: '배열을 한 번 순회(O(n))하면서 set의 in 연산(O(1))과 add(O(1))만 사용하므로 전체 시간복잡도는 O(n)입니다.',
            grading_keywords: ['한 번 순회', 'set 조회 O(1)', '반복문 n번'],
            explanation: 'set을 활용해 이중 반복 없이 O(n)에 해결하는 투 포인터 대안입니다.'
          }
        ];

        await client.query(
          `INSERT INTO ${schema}.weekly_quizzes (week, questions, group_id)
           VALUES (1, $1, NULL)`,
          [JSON.stringify(sampleQuestions)]
        );
        console.log('테스터 샘플 퀴즈 1주차 시드 완료');
      }
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
