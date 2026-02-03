import type { AIAnalysisResult } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
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
# [CRITICAL ROLE: NAVER MAP SEO & WALKING MISSION EXPERT]

당신은 네이버 지도 SEO 전문가이자 도보 미션 설계자입니다.
사장님들이 "검색했는데 우리 가게가 안 나와요!"라고 불평하지 않도록,
**실제로 검색하면 지도에 매장이 뜨는 키워드**를 만들어야 합니다.

## [INPUT DATA]
- **Store Name**: ${storeName}
- **Address**: ${address}${extraBlock}

## [CRITICAL RULES - 반드시 준수]

### 1️⃣ 네이버 지도 강제 노출 키워드 구조
- **끝은 반드시 명사**: 카페, 맛집, 식당, 바, 가게, 샵 등
- **금지**: 형용사 끝 (좋은, 예쁜, 맛있는 등으로 끝나면 블로그만 뜸!)
- **공식**: [지역명] + [구체적 특징/니즈] + [카테고리 명사]

### 2️⃣ 매장명 절대 금지
- target_keywords와 selected_keyword에 **매장명(${storeName})을 절대 넣지 마세요**
- 대신 주소 기반 **지역명**(동/대로/역) + 카테고리 + 특징 조합
- 목표: "이 키워드로 검색하면 우리 매장이 나오는" SEO 키워드

### 3️⃣ 출발지 선정 (출구 번호까지 정확하게!)
- **출발지 형식: "역명 N번출구"** (예: "신사역 8번출구", "을지로3가역 5번출구")
- **선정 기준:**
  1. 주소에서 가장 가까운 지하철역 선택 (500m 이내)
  2. **반드시 출구 번호 포함** (1~10번 중 매장에 가장 가까운 출구)
  3. 도보로 1-15분 거리가 적절
  4. 지하철역이 없으면 버스정류장이나 랜드마크 사용
- **예시:**
  - ✅ "한성대입구역 6번출구" (출구 번호 있음)
  - ✅ "신사역 8번출구" (출구 번호 있음)
  - ❌ "한성대입구역" (출구 번호 없음)
  - ❌ "신사역" (출구 번호 없음)
- **도보/자전거 시간은 네이버 지도 기준으로 정확히 계산**
  - 절대 짧게 말하지 마세요! (실제 12분인데 5분이라고 하면 사용자가 화냄!)

### 4️⃣ 3개의 다양한 SEO 키워드 제시
각각 다른 각도로 접근:
1. 지역 + 대표메뉴 + 카테고리
2. 지역 + 분위기/특징 + 카테고리
3. 지역 + 타겟고객 + 카테고리

**⚠️ 실제 고객 리뷰 키워드 참고:**
- 다이닝코드, 네이버 플레이스, 구글 리뷰에서 실제로 고객들이 많이 쓰는 키워드 반영
- 예: "데이트하기 좋은", "혼밥 가능한", "인스타 감성", "뷰 맛집", "가성비 좋은" 등
- 매장의 실제 강점과 고객 반응을 키워드에 녹여내세요

### 5️⃣ 구체성 vs 경쟁력 균형 (실제 검색어 기반)
- 너무 일반적: "강남 맛집" → 경쟁자만 나옴 ❌
- 너무 구체적: "강남역 3번출구 앞 파스타 맛집" → 검색량 0 ❌
- 적절한 구체성: "강남 수제파스타 맛집" → 우리 매장 노출 ✅

**실제 고객들이 검색하는 방식:**
- "지역 + 상황/니즈 + 카테고리" (예: "성수동 데이트 카페")
- "지역 + 메뉴특징 + 카테고리" (예: "홍대 수제버거 맛집")
- "지역 + 분위기 + 카테고리" (예: "이태원 힙한 바")

다이닝코드, 인스타그램 해시태그, 네이버 연관검색어에서 실제로 사용되는 표현을 참고하세요.

## [JSON OUTPUT FORMAT]

반드시 아래 JSON 형식만 출력하세요. 설명이나 다른 텍스트는 절대 포함하지 마세요.

성공 시:
{
  "status": "success",
  "store_analysis": {
    "summary": "매장의 핵심 특징과 경쟁력을 2-3문장으로 요약 (지도 노출 최적화 관점)\n⚠️ 실제 고객 리뷰 키워드를 반영하세요 (다이닝코드, 네이버, 인스타 등)",
    "vibe": "네이버 검색 알고리즘이 인식하기 좋은 매장 특성 (카테고리, 분위기, 타겟층)\n실제 고객들이 많이 언급하는 키워드 중심으로"
  },
  "seo_strategy": {
    "target_keywords": [
      "지역+대표메뉴+카테고리 (매장명 제외, 실제 검색어 기반)",
      "지역+분위기+카테고리 (다이닝코드/인스타 해시태그 참고)",
      "지역+타겟고객+카테고리 (실제 고객 리뷰 반영)"
    ],
    "competitiveness": "각 키워드별 경쟁력과 노출 가능성 분석 (2-3문장)\n실제 검색 시 이 매장이 상위 노출될 가능성과 이유"
  },
  "user_mission": {
    "start_point": "가장 가까운 지하철역 + 출구번호 (예: 신사역 8번출구, 한성대입구역 6번출구)\n⚠️ 반드시 출구 번호를 포함하세요! (N번출구)",
    "selected_keyword": "target_keywords 중 가장 효과적인 1개 (매장명 제외, 검색 시 이 매장이 나오도록)",
    "quiz_question": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
    "correct_answer": "N분 (⚠️ 네이버 지도 실제 도보 시간, 절대 과소평가 금지!)",
    "bicycle_time": "N분 (자전거 시간, 보통 도보의 40-50% 정도)",
    "guide_text": "네이버 지도 앱에서 '${storeName}'을(를) 검색하여 실제 도보 시간을 확인하세요."
  },
  "actual_address": "${address} (입력된 주소 그대로 반환)",
  "reasoning": "키워드가 명사로 끝나고, 매장명 없이도 검색 가능하며, 도보 시간이 정확한 이유 설명"
}

실패 시:
{
  "status": "fail",
  "reason": "데이터 확인 불가 또는 주소 정보 부족"
}

## [ADDITIONAL CONTEXT]
${category ? `- 카테고리(${category})를 키워드에 반드시 반영하세요.` : ''}
${signatureMenu ? `- 시그니처 메뉴(${signatureMenu})를 키워드 후보에 활용하세요.` : ''}
${storeDescription ? `- 한 줄 소개(${storeDescription})를 참고해 차별화된 키워드를 만드세요.` : ''}

**🎯 실제 리뷰 플랫폼 키워드 참고:**
- 다이닝코드에서 이 매장과 비슷한 타입의 매장에 달린 리뷰 키워드 분석
- "데이트", "혼밥", "가성비", "분위기", "인스타", "뷰맛집" 같은 실제 검색어
- 고객들이 실제로 매장을 찾을 때 쓰는 자연스러운 표현 사용

## [FINAL VALIDATION CHECKLIST]
✅ target_keywords에 "${storeName}" 포함 안 됨
✅ selected_keyword가 "[지역]+[특징]+[명사]" 구조
✅ 모든 키워드가 명사로 끝남 (카페/맛집/식당/바/샵)
✅ start_point에 출구 번호 포함 (예: "신사역 8번출구", "한성대입구역 6번출구")
✅ 도보 시간이 과소평가되지 않음
✅ 출발지가 500m 이내 가까운 역
✅ JSON 형식만 출력 (설명 없음)

**지금 바로 JSON만 생성하세요. 다른 설명은 절대 쓰지 마세요.**
    `.trim();
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

/** AI 응답 결과 검증 */
function validateAIResult(result: AIAnalysisResult): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!result.store_analysis?.summary) {
        errors.push('- 매장 분석 요약이 없습니다.');
    }
    if (!result.store_analysis?.vibe) {
        errors.push('- 매장 분위기 정보가 없습니다.');
    }

    // SEO 전략 검증
    if (!result.seo_strategy?.target_keywords || result.seo_strategy.target_keywords.length === 0) {
        errors.push('- SEO 키워드가 생성되지 않았습니다.');
    }
    if (result.seo_strategy?.target_keywords && result.seo_strategy.target_keywords.length < 3) {
        errors.push('- SEO 키워드가 3개 미만입니다. (최소 3개 필요)');
    }

    // 미션 정보 검증
    if (!result.user_mission?.start_point) {
        errors.push('- 출발지 정보가 없습니다.');
    } else {
        // 출구 번호 포함 여부 검증
        const hasExitNumber = /\d+번출구/.test(result.user_mission.start_point);
        if (!hasExitNumber && result.user_mission.start_point.includes('역')) {
            errors.push('- 출발지에 출구 번호가 없습니다. (예: "신사역 8번출구")');
        }
    }
    if (!result.user_mission?.selected_keyword) {
        errors.push('- 선택된 키워드가 없습니다.');
    }
    if (!result.user_mission?.quiz_question) {
        errors.push('- 퀴즈 질문이 없습니다.');
    }
    if (!result.user_mission?.correct_answer) {
        errors.push('- 정답이 없습니다.');
    }

    // 정답 형식 검증 (N분 형식인지 확인)
    if (result.user_mission?.correct_answer && !result.user_mission.correct_answer.match(/\d+분/)) {
        errors.push('- 정답이 "N분" 형식이 아닙니다.');
    }

    // 키워드에 매장명이 포함되어 있는지 검증 (금지)
    const storeName = result.actual_address || '';
    if (result.user_mission?.selected_keyword && storeName && 
        result.user_mission.selected_keyword.includes(storeName.split(' ')[0])) {
        errors.push('- 선택된 키워드에 매장명이 포함되어 있습니다. (매장명 제외 필요)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export const analyzePlaceWithAI = async ({ storeName, address, category, signatureMenu, storeDescription }: AnalyzeInput): Promise<AIAnalysisResult> => {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error(
                'Gemini API 키가 설정되지 않았습니다.\n\n' +
                '해결 방법:\n' +
                '1. Google AI Studio에서 API 키 발급: https://aistudio.google.com/app/apikey\n' +
                '2. .env 파일에 VITE_GEMINI_API_KEY=발급받은_키 추가\n' +
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

        // Gemini API 호출 (다중 모델 폴백)
        let response: Response | undefined;
        const models = [
            'gemini-2.0-flash',      // 2.0 Flash (안정, 1순위)
            'gemini-2.0-flash-exp',  // 최신 실험 모델
            'gemini-1.5-flash',      // 1.5 Flash
            'gemini-1.5-pro',        // 1.5 Pro (고품질)
        ];
        
        let lastError;
        let successModel = '';
        
        for (const model of models) {
            try {
                console.log(`🔄 Gemini 모델 시도: ${model}`);
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
                                topP: 0.95,
                                topK: 40,
                                maxOutputTokens: 8192,
                                responseMimeType: 'application/json', // JSON 응답 강제
                            },
                            safetySettings: [
                                {
                                    category: 'HARM_CATEGORY_HARASSMENT',
                                    threshold: 'BLOCK_NONE'
                                },
                                {
                                    category: 'HARM_CATEGORY_HATE_SPEECH',
                                    threshold: 'BLOCK_NONE'
                                },
                                {
                                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                                    threshold: 'BLOCK_NONE'
                                },
                                {
                                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                                    threshold: 'BLOCK_NONE'
                                }
                            ]
                        })
                    }
                );
                
                if (response.ok) {
                    successModel = model;
                    console.log(`✅ AI 분석 완료 (Gemini ${model})`);
                    break;
                }
                lastError = await response.json().catch(() => ({}));
                console.warn(`❌ ${model} 실패:`, lastError);
            } catch (error) {
                console.warn(`❌ ${model} 오류:`, error);
                lastError = error;
            }
        }

        if (!response || !response.ok) {
            const errorData = lastError || {};
            console.error('❌ 모든 Gemini 모델 실패. 마지막 오류:', errorData);
            throw new Error(
                `Gemini API 호출 실패 (상태: ${response?.status || 'FAILED'})\n\n` +
                `오류 메시지: ${(errorData as { error?: { message?: string } })?.error?.message || '모든 모델 접근 실패'}\n\n` +
                `해결 방법:\n` +
                `1. API 키 재발급: https://aistudio.google.com/app/apikey\n` +
                `2. API 키가 활성화되었는지 확인\n` +
                `3. 브라우저 콘솔에서 geminiTest.connection() 실행하여 테스트`
            );
        }

        const data = await response.json();
        console.log(`📊 Gemini ${successModel} 응답:`, JSON.stringify(data, null, 2));
        
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
            throw new Error('Gemini API 응답이 비어있습니다. 모델이 응답을 생성하지 못했습니다.');
        }

        console.log("🔍 AI 원본 응답:", text.substring(0, 500) + (text.length > 500 ? '...' : ''));

        // JSON 파싱 (멀티라인 지원)
        let result: AIAnalysisResult;
        try {
            const jsonStr = extractJsonFromResponse(text);
            result = JSON.parse(jsonStr);
            console.log("✅ JSON 파싱 성공:", result);
        } catch (e) {
            console.error("❌ JSON 파싱 오류:", e, "\n원본 응답:", text);
            throw new Error(
                "AI 응답을 파싱할 수 없습니다.\n\n" +
                "가능한 원인:\n" +
                "1. Gemini가 유효한 JSON을 생성하지 못함\n" +
                "2. 응답이 안전 필터에 의해 차단됨\n" +
                "3. 프롬프트가 너무 복잡함\n\n" +
                "브라우저 콘솔에서 geminiTest.ask('테스트 메시지')로 API 연결을 확인하세요."
            );
        }

        if (result.status === 'fail') {
            throw new Error(result.reasoning || "매장 정보를 확인할 수 없습니다.");
        }

        if (!result.store_analysis || !result.seo_strategy || !result.user_mission) {
            console.error("❌ 불완전한 AI 응답:", result);
            throw new Error(
                "AI가 불완전한 데이터를 생성했습니다.\n\n" +
                "누락된 항목:\n" +
                `- store_analysis: ${result.store_analysis ? '✓' : '✗'}\n` +
                `- seo_strategy: ${result.seo_strategy ? '✓' : '✗'}\n` +
                `- user_mission: ${result.user_mission ? '✓' : '✗'}\n\n` +
                "다시 시도하거나 매장 정보를 더 자세히 입력해주세요."
            );
        }

        // 데이터 검증 강화
        const validation = validateAIResult(result);
        if (!validation.valid) {
            console.error("❌ AI 응답 검증 실패:", validation.errors);
            throw new Error(
                "AI 응답 검증 실패:\n\n" +
                validation.errors.join('\n')
            );
        }

        // 캐시 저장 (30분)
        analysisCache.set(prompt, {
            result,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        console.log("✅ AI 미션 생성 완료:", {
            selectedKeyword: result.user_mission.selected_keyword,
            startPoint: result.user_mission.start_point,
            correctAnswer: result.user_mission.correct_answer,
        });

        return result;
    } catch (error) {
        console.error("❌ AI 분석 실패:", error);
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
