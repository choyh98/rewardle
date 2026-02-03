// aiMissionService.ts - AI 기반 매장 분석 및 미션 생성

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** AI 분석 입력 타입 */
export interface AnalyzeInput {
    placeUrl: string; // 필수! 네이버 플레이스 URL
    storeName?: string; // 선택 (크롤링 실패 시 사용)
    address?: string; // 선택 (크롤링 실패 시 사용)
    category?: string; // 선택 (크롤링 실패 시 사용)
    signatureMenu?: string;
    storeDescription?: string;
}

/** AI 분석 결과 */
export interface AIAnalysisResult {
    success: boolean;
    keywordList: string[];
    user_mission: {
        question: string;
        choices: string[];
        answer: number;
        walking_time: string;
        bicycle_time: string;
    };
    summary: string;
    reasoning?: string;
}

/** 전문적인 SEO 분석 프롬프트 */
function buildProfessionalPrompt(input: AnalyzeInput, scrapedInfo?: any): string {
    // 크롤링 데이터가 있으면 우선 사용
    const storeName = scrapedInfo?.name || input.storeName || '매장명 확인 필요';
    const address = scrapedInfo?.address || input.address || '주소 확인 필요';
    const category = scrapedInfo?.category || input.category || '';
    const { signatureMenu, storeDescription, placeUrl } = input;
    
    return `# [ROLE: 로컬 비즈니스 SEO & 마케팅 전문가]

당신은 네이버 플레이스 SEO 최적화 전문가입니다. 주어진 매장 정보를 분석하여 **실제로 검색되는 SEO 키워드**를 생성하세요.

## [입력 정보]
- **매장명**: ${storeName}
- **주소**: ${address}
${category ? `- **카테고리**: ${category}` : ''}
${signatureMenu ? `- **시그니처**: ${signatureMenu}` : ''}
${storeDescription ? `- **특징**: ${storeDescription}` : ''}
- **🔗 네이버 플레이스**: ${placeUrl}

${scrapedInfo ? `
## [실제 크롤링 데이터]
- **평점**: ${scrapedInfo.rating} (리뷰 ${scrapedInfo.reviewCount}개)
- **대표 메뉴**: ${scrapedInfo.menus.slice(0, 5).join(', ')}
- **주요 키워드**: ${scrapedInfo.keywords.join(', ')}
- **대표 리뷰**: ${scrapedInfo.reviews.slice(0, 3).join(' / ')}
` : ''}

---

## [OUTPUT 규칙]

### 1️⃣ 키워드 생성 (keywordList)
**⚠️ 매장의 독특한 특징을 찾아내세요!**

**좋은 예시:**
- "lp바", "수제버거", "클래식음악", "루프탑", "애견동반", "24시간카페"
- "신사동맛집", "이태원카페", "홍대술집", "강남디저트"

**나쁜 예시:**
- ❌ 매장명 포함 ("카페ABC", "ABC레스토랑")
- ❌ 초광범위 ("서울맛집", "맛집추천")
- ❌ 중복/유사 ("강남카페" + "강남에서카페")

**필수 조건:**
- 정확히 **5개** 생성
- 각 키워드는 **명사**로 끝나야 함
- 각 키워드는 **서로 다른 검색 의도** 반영
- 띄어쓰기 없는 복합명사 선호 ("애견동반카페" O, "애견 동반 카페" X)

### 2️⃣ 도보/자전거 시간 (user_mission)
- **walking_time**: "도보 X분" 형식 (실제 거리 기반, 네이버 지도 기준)
- **bicycle_time**: "자전거 Y분" 형식 (도보의 1/3 정도)

### 3️⃣ 퀴즈 생성 (user_mission)
- **question**: 매장의 핵심 특징을 묻는 질문
- **choices**: 4개의 선택지 (1개 정답, 3개 오답)
- **answer**: 정답 번호 (0~3)

### 4️⃣ 요약 (summary)
- 1~2문장으로 매장의 핵심 특징 요약
- SEO 키워드 자연스럽게 포함

---

## [JSON 출력 형식]

\`\`\`json
{
  "success": true,
  "keywordList": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "user_mission": {
    "question": "이 매장의 대표 메뉴는?",
    "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": 0,
    "walking_time": "도보 5분",
    "bicycle_time": "자전거 2분"
  },
  "summary": "매장 특징 요약",
  "reasoning": "키워드 선정 근거"
}
\`\`\`

---

## [주의사항]
- "이 매장" 같은 지시어 사용 금지
- "강남 맛집" 같은 초광범위 키워드
- 매장명 포함 ("${storeName}" X)
- 형용사로 끝나는 키워드
- fail 처리 (반드시 success로 결과 생성)
`;
}

/** JSON 추출 */
function extractJSON(text: string): string {
    const jsonMatch = text.match(/```json\s*([\s\S]+?)```/);
    if (jsonMatch?.[1]) return jsonMatch[1].trim();
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start >= 0 && end > start) return text.substring(start, end);
    
    return text.trim();
}

/** 크롤링 데이터 가져오기 */
async function scrapeNaverPlace(placeUrl: string): Promise<{ text: string; data?: any }> {
    try {
        // 로컬 개발 환경에서는 크롤링 건너뛰기
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 로컬 환경: 크롤링 건너뛰고 AI 웹 검색 사용');
            return { text: '' };
        }
        
        console.log('🔍 네이버 플레이스 크롤링...');
        const res = await fetch('/api/scrape-naver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeUrl })
        });
        
        if (res.ok) {
            const result = await res.json();
            if (result.success) {
                console.log('✅ 크롤링 성공!', result.data);
                return {
                    text: `\n\n# [실제 크롤링 데이터]\n${result.analysisText}\n`,
                    data: result.data
                };
            }
        }
    } catch (err) {
        console.warn('⚠️ 크롤링 실패:', err);
    }
    return { text: '' };
}

/** Gemini AI 호출 */
async function callGemini(prompt: string, placeUrl: string, useWebSearch: boolean): Promise<string> {
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-exp-1206'];
    
    // 웹 검색 명령 추가
    const searchCommand = useWebSearch ? `\n\n🔍 **필수**: "${placeUrl}" 이 URL로 직접 접속해서 매장 정보를 확인하세요! 추측하지 마세요!` : '';
    const finalPrompt = prompt + searchCommand;
    
    for (const model of models) {
        try {
            console.log(`🟢 ${model} 시도...`);
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: finalPrompt }] }],
                        generationConfig: {
                            temperature: 0.5, // 더 정확하게
                            maxOutputTokens: 8192,
                        },
                        ...(useWebSearch && { tools: [{ google_search: {} }] })
                    })
                }
            );
            
            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                    console.log(`✅ ${model} 성공!`);
                    return text;
                }
            }
        } catch (err) {
            console.warn(`${model} 실패:`, err);
        }
    }
    
    throw new Error('모든 Gemini 모델 실패');
}

/** 캐시 (중복 요청 방지) */
const analysisCache = new Map<string, AIAnalysisResult>();

/** AI 매장 분석 (메인 함수) */
export async function analyzePlaceWithAI(input: AnalyzeInput): Promise<AIAnalysisResult> {
    const { placeUrl } = input;
    
    // 캐시 확인
    if (analysisCache.has(placeUrl)) {
        console.log('✅ 캐시에서 결과 반환');
        return analysisCache.get(placeUrl)!;
    }
    
    try {
        // 1단계: 크롤링 시도 (배포 환경에서만)
        const { text: scrapedText, data: scrapedData } = await scrapeNaverPlace(placeUrl);
        
        // 2단계: 프롬프트 생성 (크롤링 데이터 포함)
        const prompt = buildProfessionalPrompt(input, scrapedData);
        
        // 3단계: AI 호출 (크롤링 성공 시 웹 검색 비활성화)
        const useWebSearch = !scrapedText;
        const aiResponse = await callGemini(prompt, placeUrl, useWebSearch);
        
        // 4단계: JSON 파싱
        const jsonText = extractJSON(aiResponse);
        const result: AIAnalysisResult = JSON.parse(jsonText);
        
        // 캐시 저장
        analysisCache.set(placeUrl, result);
        
        console.log('✅ AI 분석 완료:', result);
        return result;
        
    } catch (err) {
        console.error('AI 분석 실패:', err);
        throw err;
    }
}

/** 네이버 지도 검색 URL 생성 */
export function getNaverSearchUrl(address: string, storeName: string): string {
    const query = encodeURIComponent(`${address} ${storeName}`);
    return `https://map.naver.com/p/search/${query}`;
}
