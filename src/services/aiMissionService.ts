import type { AIAnalysisResult } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CLOVA_STUDIO_ENDPOINT = import.meta.env.VITE_CLOVA_STUDIO_ENDPOINT || 'HCX-003';

if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API 키가 없습니다. CLOVA는 /api/clova-chat 프록시로 시도되며, 배포 시 Vercel에 CLOVA_STUDIO_CLIENT_ID·CLIENT_SECRET을 설정하세요.');
}

/** 캐시 항목 (30분 유효) */
const CACHE_TTL_MS = 30 * 60 * 1000;
const analysisCache = new Map<string, { result: AIAnalysisResult; expiresAt: number }>();

interface AnalyzeInput {
    storeName: string;
    address: string;
    category: string;
    signatureMenu?: string;
    storeDescription?: string;
}

/**
 * AI로 매장 분석 및 미션 생성
 * Gemini API를 사용하여 SEO 키워드와 도보 미션 자동 생성
 */
/** AI 분석용 프롬프트 생성 */
function buildAnalysisPrompt(input: AnalyzeInput): string {
    const { storeName, address, category, signatureMenu, storeDescription } = input;
    const extraLines: string[] = [];
    if (category) extraLines.push(`- **Category**: ${category}`);
    if (signatureMenu) extraLines.push(`- **Signature menu / product**: ${signatureMenu}`);
    if (storeDescription) extraLines.push(`- **One-line description / vibe**: ${storeDescription}`);
    const extraBlock = extraLines.length ? '\n' + extraLines.join('\n') : '';

    return `
            # [CRITICAL ROLE: NAVER MAP UI HACKER]
            사장님의 분노: "키워드는 좋은데, 검색하면 지도가 안 나오고 블로그만 나온다!"
            원인: 키워드가 너무 문장형이거나 형용사로 끝나면 네이버는 '정보 검색'으로 인식해 블로그를 보여줍니다.
            해결책: **"무조건 지도(Place)가 뜨는 키워드 구조"**로 개조해야 합니다.

            # [INPUT]
            - **Store**: ${storeName}
            - **Address**: ${address} (Must verify strict match)${extraBlock}

            # [CRITICAL: ACCURATE WALKING TIME]
            ⚠️ 도보 시간은 반드시 정확해야 합니다!
            - 네이버 지도에서 실제 경로 검색 결과를 기반으로 계산하세요
            - 출발지는 매장으로부터 500m 이내의 실제 역/랜드마크여야 합니다
            - 도보 시간은 네이버 지도 기준 시간을 그대로 사용하세요 (과소평가 금지!)
            - 예시: "한성대입구역 6번출구"에서 매장까지 실제로 15분 걸리면 "15분"이라고 정확히 써야 합니다

            # [HACKING STRATEGY: 지도 강제 소환술]
            1. **Map Trigger Rule (명사형 종결)**:
               - 키워드의 끝은 무조건 **'매장 형태를 나타내는 명사'**로 끝나야 합니다.
               - (X) '성북동 데이트하기 좋은' (형용사 끝 -> 블로그 뜸)
               - (O) '성북동 데이트하기 좋은 **카페**' (명사 끝 -> 지도 뜸)
               - (O) '성북동 수제 버터바 **맛집**' (명사 끝 -> 지도 뜸)
            
            2. **Blue Ocean Detail**:
               - 경쟁자가 없는 디테일은 챙기되, 구조는 지켜야 합니다.
               - 공식: **[지역명]** + **[구체적 니즈/특징]** + **[카테고리(카페/맛집/바)]**

            3. **3개의 다양한 후보 제시**:
               - 각각 다른 각도로 접근
               - 예시: 1) 지역+특징+카테고리, 2) 지역+분위기+카테고리, 3) 지역+시그니처메뉴+카테고리

            4. **⚠️ 핵심: 키워드에 매장명 넣지 말고, 검색하면 이 가게가 나오는 키워드로**
               - target_keywords / selected_keyword에 **매장명(Store)은 절대 넣지 마세요.** (예: "썬더버드" X)
               - 대신 **주소에서 나오는 지역명(동/대로/역)** + **카테고리** + **이 매장만의 특징(시그니처 메뉴, 한 줄 소개)**을 조합해서,
               - 네이버 지도/검색에서 **그 키워드로 검색했을 때 이 매장이 검색 결과에 나오는** 키워드를 만들어야 합니다.
               - 즉 "매장명 없이 검색해도 우리 가게가 노출되는" SEO 키워드. 너무 일반적인 키워드(예: "강남 맛집"만)면 다른 가게만 나오므로, 주소·카테고리·대표 메뉴·분위기 등을 구체적으로 결합하세요.

            # [JSON Output Format]
            성공 시:
            {
              "status": "success",
              "store_analysis": {
                "summary": "지도 노출을 위한 최적의 카테고리/특징 분석",
                "vibe": "네이버가 인식하기 좋은 구조적 특징"
              },
              "seo_strategy": {
                "target_keywords": [
                  "지역+특징+카테고리 (매장명 없음, 검색 시 이 매장 노출되도록 구체적 조합)",
                  "지역+분위기+카테고리",
                  "지역+시그니처메뉴+카테고리"
                ],
                "competitiveness": "각 키워드별 경쟁력 분석"
              },
              "user_mission": {
                "start_point": "매장 위치 기준 가장 가까운 실제 역/랜드마크 (500m 이내)",
                "selected_keyword": "매장명 없이 검색해도 이 매장이 나오는 키워드 (지역+특징+카테고리)",
                "quiz_question": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
                "correct_answer": "N분 (⚠️ 반드시 네이버 지도 실제 도보 시간 기준, 과소평가 금지!)",
                "guide_text": "네이버 지도 앱에서 확인하세요."
              },
              "actual_address": "구글 검색으로 확인된 실제 주소",
              "reasoning": "끝단어가 명사(카페/맛집/샵)로 끝나서 네이버가 무조건 지도 탭을 띄우게 설계함."
            }

            실패 시:
            {
              "status": "fail",
              "reason": "데이터 확인 불가."
            }

            ${category ? `위 [INPUT]의 Category를 반드시 키워드/카테고리 결정에 반영하세요.` : ''}
            ${signatureMenu ? `시그니처 메뉴/상품을 키워드 후보에 활용하세요 (지역+메뉴+카테고리).` : ''}
            ${storeDescription ? `한 줄 소개/분위기를 참고해 차별화된 키워드를 제안하세요.` : ''}

            **최종 확인**: target_keywords와 selected_keyword에는 매장명("${storeName}")을 넣지 마세요. 주소(Address)·카테고리(Category)·시그니처 메뉴·한 줄 소개를 조합해, 네이버에서 그 키워드로 검색했을 때 이 매장이 검색 결과에 나오는 구체적인 키워드로 설계하세요.

            반드시 JSON만 출력하세요. 다른 설명은 넣지 마세요.
        `;
}

/** CLOVA Studio 프록시 호출 (브라우저 CORS 회피, 15초 타임아웃) */
async function callClovaViaProxy(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch('/api/clova-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, endpoint: CLOVA_STUDIO_ENDPOINT }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
        if (!res.ok) {
            const msg = data?.error || (res.status === 404
                ? 'CLOVA 프록시를 찾을 수 없습니다. 로컬: .env에 VITE_CLOVA_PROXY_TARGET=배포URL 추가 후 재시작, 또는 배포 환경에서 사용'
                : `CLOVA 프록시 ${res.status}`);
            throw new Error(msg);
        }
        const text = data?.text ?? '';
        if (!text) throw new Error('CLOVA 응답에 content가 없습니다.');
        return text;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('CLOVA 요청 시간 초과 (15초)');
        }
        throw err;
    }
}

/** AI 응답 텍스트에서 JSON 객체 추출 */
function extractJsonFromResponse(text: string): string {
    const blockMatch = text.match(/```json\s*([\s\S]+?)```/);
    if (blockMatch?.[1]) return blockMatch[1].trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start >= 0 && end > start) return text.substring(start, end);
    return text.trim();
}

export const analyzePlaceWithAI = async ({ storeName, address, category, signatureMenu, storeDescription }: AnalyzeInput): Promise<AIAnalysisResult> => {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error(
                'AI API 키가 설정되지 않았습니다.\n\n' +
                '해결 방법:\n' +
                '1. CLOVA: Vercel 대시보드에 CLOVA_STUDIO_CLIENT_ID, CLOVA_STUDIO_CLIENT_SECRET 설정 (NCP 인증 정보에서 발급)\n' +
                '2. Gemini: Google AI Studio에서 API 키 발급 후 .env에 VITE_GEMINI_API_KEY 추가\n' +
                '3. 개발 서버 재시작 (npm run dev)'
            );
        }

        const prompt = buildAnalysisPrompt({ storeName, address, category, signatureMenu, storeDescription });

        // 캐시 확인 (30분 유효)
        const cached = analysisCache.get(prompt);
        if (cached && cached.expiresAt > Date.now()) {
            console.log('✅ AI 분석 캐시 적중');
            return cached.result;
        }

        let text = '';
        let usedProvider: 'clova' | 'gemini' | null = null;

        // 1) CLOVA Studio 프록시 우선 시도 (CORS 회피)
        try {
            console.log('🟢 CLOVA Studio 프록시 호출 중...');
            text = await callClovaViaProxy(prompt);
            usedProvider = 'clova';
            console.log('✅ AI 분석 완료 (사용 API: CLOVA Studio)', { responseLength: text?.length });
        } catch (clovaError) {
            console.warn('CLOVA Studio 실패, Gemini로 폴백:', clovaError);
        }

        // 2) CLOVA 실패 또는 미설정 시 Gemini 시도
        if (!text && GEMINI_API_KEY) {
            let response: Response | undefined;
            const models = [
            'gemini-2.5-flash',      // 최신 2.5 Flash
            'gemini-2.5-pro',        // 최신 2.5 Pro
            'gemini-2.0-flash',      // 2.0 Flash
            'gemini-exp-1206',       // Experimental
            'gemini-flash-latest'    // Fallback
        ];
        
        let lastError;
        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: prompt
                                }]
                            }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 8192, // 더 긴 응답을 위해 증가
                            }
                        })
                    }
                );
                
                if (response.ok) {
                    usedProvider = 'gemini';
                    console.log(`✅ AI 분석 완료 (사용 API: Gemini, 모델: ${model})`);
                    break;
                }
                lastError = await response.json().catch(() => ({}));
                console.warn(`Model ${model} failed:`, lastError);
            } catch (error) {
                console.warn(`Model ${model} error:`, error);
                lastError = error;
            }
        }

            if (!response || !response.ok) {
                const errorData = lastError || {};
                console.error('All Gemini models failed. Last error:', errorData);
                throw new Error(
                    `Gemini API Error: ${response?.status || 'FAILED'} - ${(errorData as { error?: { message?: string } })?.error?.message || '모든 모델 접근 실패'}\n\n` +
                    `API 키를 재발급받으세요: https://aistudio.google.com/app/apikey`
                );
            }

            const data = await response.json();
            if (usedProvider === 'gemini') {
                console.log('Gemini API Response:', JSON.stringify(data, null, 2));
            }
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        if (!text) {
            throw new Error('AI 응답을 받지 못했습니다. CLOVA 또는 Gemini API 키를 확인하세요.');
        }

        console.log("AI 원본 응답:", text);

        // JSON 파싱 (멀티라인 지원)
        let result: AIAnalysisResult;
        try {
            const jsonStr = extractJsonFromResponse(text);
            result = JSON.parse(jsonStr);
        } catch (e) {
            console.error("JSON 파싱 에러:", e, "원본:", text);
            throw new Error("AI 응답 파싱 실패");
        }

        if (result.status === 'fail') {
            throw new Error(result.reasoning || "매장 정보를 확인할 수 없습니다.");
        }

        if (!result.store_analysis || !result.seo_strategy || !result.user_mission) {
            throw new Error("AI 응답 데이터가 불완전합니다.");
        }

        // 캐시 저장 (30분)
        analysisCache.set(prompt, {
            result,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return result;
    } catch (error) {
        console.error("AI 분석 실패:", error);
        throw error;
    }
};

/**
 * 네이버 지도 검색 URL 생성
 */
export const getNaverMapSearchUrl = (keyword: string): string => {
    return `https://map.naver.com/v5/search/${encodeURIComponent(keyword)}`;
};

/**
 * 네이버 지도 길찾기 URL 생성 (출발지 → 도착지)
 * @param _startPoint 출발지 (예: "한성대입구역 6번출구")
 * @param destination 도착지 (매장명 또는 주소)
 * @param _type 교통수단 (walk: 도보, bike: 자전거)
 */
export const getNaverMapDirectionsUrl = (
    _startPoint: string, 
    destination: string,
    _type: 'walk' | 'bike' = 'walk'
): string => {
    const baseUrl = 'https://map.naver.com/p/directions';
    // 네이버 지도 길찾기 URL 형식
    // 출발지와 도착지를 쿼리로 전달
    return `${baseUrl}/-/${encodeURIComponent(destination)}/walk?c=15,0,0,0,dh`;
};

/**
 * 네이버 검색 URL 생성 (검증용)
 */
export const getNaverSearchUrl = (keyword: string): string => {
    return `https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`;
};
