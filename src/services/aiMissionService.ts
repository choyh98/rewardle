import type { AIAnalysisResult } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDNovfloH3x01CX1HLi0gW3YxtiibNEXJk";

interface AnalyzeInput {
    storeName: string;
    address?: string;
}

/**
 * AI로 매장 분석 및 미션 생성
 * Gemini API를 사용하여 SEO 키워드와 도보 미션 자동 생성
 */
export const analyzePlaceWithAI = async ({ storeName, address }: AnalyzeInput): Promise<AIAnalysisResult> => {
    try {
        const prompt = `
            # [CRITICAL ROLE: NAVER MAP UI HACKER]
            사장님의 분노: "키워드는 좋은데, 검색하면 지도가 안 나오고 블로그만 나온다!"
            원인: 키워드가 너무 문장형이거나 형용사로 끝나면 네이버는 '정보 검색'으로 인식해 블로그를 보여줍니다.
            해결책: **"무조건 지도(Place)가 뜨는 키워드 구조"**로 개조해야 합니다.

            # [INPUT]
            - **Store**: ${storeName}
            - **Address**: ${address || "Unknown"} (Must verify strict match)

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
                  "지도노출 보장형 키워드1 (지역+특징+카테고리)",
                  "지도노출 보장형 키워드2 (지역+분위기+카테고리)",
                  "지도노출 보장형 키워드3 (지역+메뉴+카테고리)"
                ],
                "competitiveness": "각 키워드별 경쟁력 분석"
              },
              "user_mission": {
                "start_point": "매장 위치 기준 가장 가까운 실제 역/랜드마크 (500m 이내)",
                "selected_keyword": "첫 번째 키워드 (가장 추천)",
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

            반드시 JSON만 출력하세요. 다른 설명은 넣지 마세요.
        `;

        // Gemini API 호출
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
                    tools: [{
                        googleSearch: {}
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log("AI 원본 응답:", text);

        // JSON 파싱
        let result: AIAnalysisResult;
        try {
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const startIdx = jsonStr.indexOf("{");
            const endIdx = jsonStr.lastIndexOf("}") + 1;
            result = JSON.parse(jsonStr.substring(startIdx, endIdx));
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
