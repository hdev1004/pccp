const express = require('express');
const OpenAI = require('openai');
const authMiddleware = require('../middleware/auth');
const wikiData = require('../data/wiki');

const router = express.Router();

// 위키 목록
router.get('/', authMiddleware, (req, res) => {
  const list = wikiData.map(({ id, title, category, icon, color, summary, week }) => ({
    id, title, category, icon, color, summary, week,
  }));
  res.json(list);
});

// 위키 상세
router.get('/:id', authMiddleware, (req, res) => {
  const item = wikiData.find(w => w.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: '위키 항목을 찾을 수 없습니다.' });
  }
  res.json(item);
});

// AI 질문
router.post('/:id/ask', authMiddleware, async (req, res) => {
  const { question } = req.body;
  const item = wikiData.find(w => w.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: '위키 항목을 찾을 수 없습니다.' });
  }

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ message: '질문을 입력해주세요.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: 'OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 위키 데이터에서 컨텍스트 구성
    const content = item.content;
    const complexityInfo = (content.complexities || [])
      .map(c => `${c.notation} — ${c.name}: ${c.description}`)
      .join('\n');
    const codeInfo = (content.codeExamples || [])
      .map(ex => `[${ex.title}]\n${ex.code}`)
      .join('\n\n');

    // 설명이 너무 길면 앞부분만 사용 (토큰 절약)
    const desc = (content.description || '').slice(0, 1500);

    const prompt = `당신은 "${item.title}" 전문가이며, 알고리즘을 초보자에게 가르치는 친절한 선생님입니다.

## 현재 학생이 공부 중인 개념: ${item.title}
${item.summary}

## 개념 상세 내용
${desc}

## 이 개념의 시간복잡도
${complexityInfo || '없음'}

## 관련 코드 예시
${codeInfo || '없음'}

---

학생의 질문: ${question}

## 답변 규칙
- 위 개념 내용을 기반으로, "${item.title}"에 특화된 답변을 하세요
- 초보자도 이해할 수 있게 비유와 예시를 들어 설명하세요
- 가능하면 Python 코드 예시를 포함하세요
- 시간복잡도를 언급할 때는 Big-O 표기법을 사용하세요
- 위 코드 예시를 참고하되, 질문에 맞게 새로운 설명이나 코드를 제공하세요
- 한국어로 답변하세요
- 마크다운 형식으로 답변하세요`;

    // SSE 스트리밍 응답
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

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI 질문 오류:', err);
    // 스트리밍 시작 전 에러면 JSON으로, 시작 후면 SSE로
    if (!res.headersSent) {
      res.status(500).json({ message: `AI 답변 생성에 실패했습니다: ${err.message}` });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
