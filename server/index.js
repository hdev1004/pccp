require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');
const { startScheduler } = require('./scheduler/quizGenerator');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/quiz', quizRoutes);

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 서버 시작
async function start() {
  try {
    await initDatabase();
    startScheduler();

    app.listen(PORT, () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('서버 시작 실패:', err);
    process.exit(1);
  }
}

start();
