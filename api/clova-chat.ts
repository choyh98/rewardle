/**
 * CLOVA Studio 프록시 API (CORS 회피)
 * 브라우저 → 이 API → CLOVA Studio
 * Vercel 환경 변수: CLOVA_STUDIO_API_KEY (필수), CLOVA_STUDIO_ENDPOINT (선택)
 */
const CLOVA_BASE_URL = 'https://clovastudio.stream.ntruss.com';
const TIMEOUT_MS = 15000;

type Req = { method?: string; body?: string | Record<string, unknown> };
type Res = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => void };
};

export default async function handler(req: Req, res: Res) {
  const method = (req.method || '').toUpperCase();
  // CORS preflight
  if (method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).json({});
  }
  if (method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed', received: req.method });
  }

  const apiKey = process.env.CLOVA_STUDIO_API_KEY;
  const endpoint = process.env.CLOVA_STUDIO_ENDPOINT || 'HCX-005';

  if (!apiKey) {
    return res.status(503).json({
      error: 'CLOVA not configured',
      message: 'Vercel에 CLOVA_STUDIO_API_KEY를 설정하세요.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}) as Record<string, unknown>;
  const prompt: string = (body.prompt ?? body.message ?? '') as string;
  const endpointParam = (body.endpoint as string) || endpoint;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${CLOVA_BASE_URL}/v1/chat-completions/${endpointParam}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.8,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = (await response.json().catch(() => ({}))) as {
      status?: { code?: string; message?: string };
      result?: { message?: { content?: string } };
      error?: { message?: string; code?: string };
    };

    if (!response.ok) {
      const msg = data?.status?.message || data?.error?.message || `CLOVA API ${response.status}`;
      console.error('CLOVA API Error:', { status: response.status, data });
      return res.status(response.status).json({ 
        error: msg,
        details: { status: response.status, code: data?.status?.code || data?.error?.code, raw: data }
      });
    }
    if (data?.status?.code !== '20000') {
      const msg = data?.status?.message || 'CLOVA API 오류';
      console.error('CLOVA API Non-20000:', data);
      return res.status(502).json({ 
        error: msg,
        details: { code: data?.status?.code, raw: data }
      });
    }

    const text = data?.result?.message?.content ?? '';
    if (!text) {
      return res.status(502).json({ error: 'CLOVA 응답에 content가 없습니다.' });
    }

    return res.status(200).json({ text });
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'CLOVA 요청 실패';
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'CLOVA 요청 시간 초과 (15초)' : message,
    });
  }
}
