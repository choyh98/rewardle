import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDNovfloH3x01CX1HLi0gW3YxtiibNEXJk";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * analyzePlaceUrl
 * @param {Object} input - { storeName, address }
 */
export const analyzePlaceUrl = async ({ storeName, address }) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            tools: [{ googleSearch: {} }]
        });

        // User Feedback: Revert to the "80% accuracy" version focused on Map Triggering.
        const prompt = `
            # [CRITICAL ROLE: NAVER MAP UI HACKER]
            사장님의 분노: "키워드는 좋은데, 검색하면 지도가 안 나오고 블로그만 나온다!"
            원인: 키워드가 너무 문장형이거나 형용사로 끝나면 네이버는 '정보 검색'으로 인식해 블로그를 보여줍니다.
            해결책: **"무조건 지도(Place)가 뜨는 키워드 구조"**로 개조해야 합니다.

            # [INPUT]
            - **Store**: ${storeName}
            - **Address**: ${address || "Unknown"} (Must verify strict match)

            # [HACKING STRATEGY: 지도 강제 소환술]
            1. **Map Trigger Rule (명사형 종결)**:
               - 키워드의 끝은 무조건 **'매장 형태를 나타내는 명사'**로 끝나야 합니다.
               - (X) '성북동 데이트하기 좋은' (형용사 끝 -> 블로그 뜸)
               - (O) '성북동 데이트하기 좋은 **카페**' (명사 끝 -> 지도 뜸)
               - (O) '성북동 수제 버터바 **맛집**' (명사 끝 -> 지도 뜸)
            
            2. **Blue Ocean Detail**:
               - 경쟁자가 없는 디테일은 챙기되, 구조는 지켜야 합니다.
               - 공식: **[지역명]** + **[구체적 니즈/특징]** + **[카테고리(카페/맛집/바)]**

            # [JSON Output Format]
            성공 시:
            {
              "status": "success",
              "store_analysis": {
                "summary": "지도 노출을 위한 최적의 카테고리/특징 분석",
                "vibe": "네이버가 인식하기 좋은 구조적 특징"
              },
              "seo_strategy": {
                "target_keywords": ["지도노출 보장형 키워드1", "지도노출 보장형 키워드2", "지도노출 보장형 키워드3"],
                "competitiveness": "지도 노출 확실함 (Blue Ocean)"
              },
              "user_mission": {
                "start_point": "매장 위치 기준 가장 가까운 실제 역/랜드마크 (500m 이내)",
                "selected_keyword": "형용사로 끝나지 않고 카테고리 명사로 끝나는 지도 소환 키워드",
                "quiz_question": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
                "correct_answer": "N분",
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
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI 원본 응답:", text);

        let data;
        try {
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const startIdx = jsonStr.indexOf("{");
            const endIdx = jsonStr.lastIndexOf("}") + 1;
            data = JSON.parse(jsonStr.substring(startIdx, endIdx));
        } catch (e) {
            console.error("JSON 파싱 에러:", e, "원본:", text);
            throw new Error("데이터 분석 실패");
        }

        if (data.status === 'fail' || !data.store_analysis) {
            throw new Error(data.reason || "매장 정보를 확인할 수 없습니다.");
        }

        return {
            ...data,
            name: data.store_analysis.summary,
            persona: data.store_analysis.summary,
            seoKeywords: data.seo_strategy.target_keywords,
            selectedKeyword: data.user_mission.selected_keyword,
            startingPoint: data.user_mission.start_point,
            verificationValue: data.user_mission.correct_answer,
            quizQuestion: data.user_mission.quiz_question,
            actualAddress: data.actual_address,
            competitiveness: data.seo_strategy.competitiveness
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
