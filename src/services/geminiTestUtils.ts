/**
 * Gemini API 테스트 및 디버깅 유틸리티
 * 
 * 사용법 (브라우저 콘솔):
 * - geminiTest.runAll() : 전체 테스트 실행
 * - geminiTest.connection() : 연결 테스트
 * - geminiTest.validateKey() : API 키 검증
 * - geminiTest.ask("질문") : 간단한 질문
 * - geminiTest.models() : 사용 가능한 모델 목록
 * - geminiTest.testMission() : 미션 생성 테스트
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Gemini API 연결 테스트
 */
export async function testGeminiConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
}> {
    try {
        if (!GEMINI_API_KEY) {
            return {
                success: false,
                message: '❌ API 키가 설정되지 않았습니다.\n.env 파일에 VITE_GEMINI_API_KEY를 추가하고 서버를 재시작하세요.',
            };
        }

        // 최신 모델부터 시도
        const models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        
        for (const model of models) {
            try {
                console.log(`🔄 ${model} 연결 테스트 중...`);
                
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: '테스트 메시지입니다. "OK"라고만 답변해주세요.'
                                }]
                            }],
                            generationConfig: {
                                temperature: 0,
                                maxOutputTokens: 10,
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`❌ ${model} 실패:`, errorData);
                    continue;
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                return {
                    success: true,
                    message: `✅ Gemini API 연결 성공! (모델: ${model})\n응답: "${text.trim()}"`,
                    details: { model, response: data },
                };
            } catch (error) {
                console.warn(`❌ ${model} 오류:`, error);
                continue;
            }
        }

        return {
            success: false,
            message: '❌ 모든 모델 연결 실패. API 키를 확인하세요.',
        };
    } catch (error: any) {
        return {
            success: false,
            message: `❌ 네트워크 오류: ${error.message}`,
            details: error,
        };
    }
}

/**
 * 사용 가능한 모델 목록 조회
 */
export async function listAvailableModels(): Promise<{
    success: boolean;
    models?: string[];
    message: string;
}> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );

        if (!response.ok) {
            return {
                success: false,
                message: `모델 목록 조회 실패: ${response.status}`,
            };
        }

        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];

        return {
            success: true,
            models,
            message: `총 ${models.length}개의 모델 사용 가능`,
        };
    } catch (error: any) {
        return {
            success: false,
            message: `오류: ${error.message}`,
        };
    }
}

/**
 * API 키 유효성 검사
 */
export function validateApiKey(apiKey?: string): {
    valid: boolean;
    message: string;
} {
    const key = apiKey || GEMINI_API_KEY;

    if (!key) {
        return {
            valid: false,
            message: 'API 키가 없습니다.',
        };
    }

    if (key.length < 30) {
        return {
            valid: false,
            message: 'API 키 길이가 너무 짧습니다.',
        };
    }

    if (!key.startsWith('AIza')) {
        return {
            valid: false,
            message: 'Google API 키 형식이 아닙니다. (AIza로 시작해야 함)',
        };
    }

    return {
        valid: true,
        message: 'API 키 형식이 올바릅니다.',
    };
}

/**
 * 간단한 AI 응답 테스트
 */
export async function testSimpleGeneration(prompt: string, model?: string): Promise<{
    success: boolean;
    response?: string;
    message: string;
    model?: string;
}> {
    try {
        const targetModel = model || 'gemini-2.0-flash';
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${GEMINI_API_KEY}`,
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
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: `❌ API 에러 (${response.status}): ${errorData.error?.message || response.statusText}`,
                model: targetModel,
            };
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            success: true,
            response: text,
            message: '✅ 응답 생성 성공',
            model: targetModel,
        };
    } catch (error: any) {
        return {
            success: false,
            message: `❌ 오류: ${error.message}`,
        };
    }
}

/**
 * 미션 생성 테스트 (실제 매장 데이터로)
 */
export async function testMissionGeneration(): Promise<{
    success: boolean;
    result?: any;
    message: string;
}> {
    try {
        const testPrompt = `
# [테스트: 미션 생성]
매장명: 카페 썬더버드
주소: 서울 성북구 성북로23길 34
카테고리: 카페
시그니처 메뉴: 수제 버터바, 핸드드립 커피

위 정보를 바탕으로 다음 JSON 형식으로 응답하세요:

{
  "status": "success",
  "store_analysis": {
    "summary": "매장 특징 요약",
    "vibe": "분위기"
  },
  "seo_strategy": {
    "target_keywords": ["키워드1", "키워드2", "키워드3"],
    "competitiveness": "경쟁력 분석"
  },
  "user_mission": {
    "start_point": "출발지",
    "selected_keyword": "선택된 키워드",
    "quiz_question": "퀴즈 질문",
    "correct_answer": "N분",
    "guide_text": "안내 텍스트"
  },
  "actual_address": "서울 성북구 성북로23길 34",
  "reasoning": "이유"
}

반드시 JSON만 출력하세요.
        `;

        const result = await testSimpleGeneration(testPrompt, 'gemini-2.0-flash');

        if (!result.success || !result.response) {
            return {
                success: false,
                message: `❌ 미션 생성 실패: ${result.message}`,
            };
        }

        try {
            // JSON 파싱 시도
            const jsonMatch = result.response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    success: false,
                    message: '❌ JSON 형식을 찾을 수 없습니다.',
                    result: result.response,
                };
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            return {
                success: true,
                result: parsed,
                message: '✅ 미션 생성 성공! 아래 결과를 확인하세요.',
            };
        } catch (e) {
            return {
                success: false,
                message: '❌ JSON 파싱 실패',
                result: result.response,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `❌ 오류: ${error.message}`,
        };
    }
}

/**
 * 브라우저 콘솔에서 사용할 수 있는 테스트 함수
 */
export const geminiTest = {
    // 연결 테스트
    async connection() {
        console.log('🔄 Gemini API 연결 테스트 중...\n');
        const result = await testGeminiConnection();
        console.log(result.message);
        if (result.details) {
            console.log('📊 상세 정보:', result.details);
        }
        return result;
    },

    // API 키 검증
    validateKey(apiKey?: string) {
        console.log('🔍 API 키 검증 중...\n');
        const result = validateApiKey(apiKey);
        console.log(result.message);
        return result;
    },

    // 간단한 질문
    async ask(prompt: string, model?: string) {
        console.log(`💬 질문: ${prompt}\n`);
        const result = await testSimpleGeneration(prompt, model);
        console.log(`📝 결과: ${result.message}`);
        if (result.response) {
            console.log(`💡 응답 (${result.model}):\n`, result.response);
        }
        return result;
    },

    // 사용 가능한 모델 목록
    async models() {
        console.log('🔄 사용 가능한 모델 목록 조회 중...\n');
        const result = await listAvailableModels();
        console.log(result.message);
        if (result.models) {
            console.log('📋 모델 목록:');
            result.models.forEach((model, i) => {
                console.log(`  ${i + 1}. ${model}`);
            });
        }
        return result;
    },

    // 미션 생성 테스트
    async testMission() {
        console.log('🎯 미션 생성 테스트 시작...\n');
        const result = await testMissionGeneration();
        console.log(result.message);
        if (result.result) {
            console.log('📦 생성된 미션 데이터:');
            console.log(JSON.stringify(result.result, null, 2));
        }
        return result;
    },

    // 현재 API 키 확인
    getApiKey() {
        if (!GEMINI_API_KEY) {
            console.log('❌ API 키가 설정되지 않았습니다.');
            return null;
        }
        const masked = GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5);
        console.log('🔑 현재 API 키:', masked);
        return masked;
    },

    // 전체 테스트 실행
    async runAll() {
        console.log('═══════════════════════════════════════');
        console.log('🚀 Gemini API 전체 테스트 시작');
        console.log('═══════════════════════════════════════\n');

        console.log('━━━ 1️⃣ API 키 검증 ━━━');
        const keyValidation = this.validateKey();
        console.log('');

        if (!keyValidation.valid) {
            console.error('❌ API 키가 유효하지 않습니다. 테스트 중단.\n');
            console.log('💡 해결 방법:');
            console.log('1. https://aistudio.google.com/app/apikey 에서 API 키 발급');
            console.log('2. .env 파일에 VITE_GEMINI_API_KEY=발급받은_키 추가');
            console.log('3. 개발 서버 재시작 (npm run dev)');
            return;
        }

        console.log('━━━ 2️⃣ 연결 테스트 ━━━');
        const connection = await this.connection();
        console.log('');

        if (!connection.success) {
            console.error('❌ 연결 실패. 추가 테스트 중단.\n');
            console.log('💡 API 키를 재발급받으세요:');
            console.log('https://aistudio.google.com/app/apikey');
            return;
        }

        console.log('━━━ 3️⃣ 간단한 질문 테스트 ━━━');
        await this.ask('안녕하세요! 간단히 인사해주세요.');
        console.log('');

        console.log('━━━ 4️⃣ 미션 생성 테스트 ━━━');
        await this.testMission();
        console.log('');

        console.log('═══════════════════════════════════════');
        console.log('✅ 전체 테스트 완료!');
        console.log('═══════════════════════════════════════\n');
        console.log('💡 추가 명령어:');
        console.log('  - geminiTest.ask("질문") : 간단한 질문');
        console.log('  - geminiTest.testMission() : 미션 생성 테스트');
        console.log('  - geminiTest.models() : 사용 가능한 모델 목록');
    },

    // 도움말
    help() {
        console.log('═══════════════════════════════════════');
        console.log('📚 Gemini Test 유틸리티 사용법');
        console.log('═══════════════════════════════════════\n');
        console.log('🔧 사용 가능한 명령어:\n');
        console.log('  geminiTest.runAll()');
        console.log('    → 전체 테스트 실행 (권장)\n');
        console.log('  geminiTest.connection()');
        console.log('    → API 연결 테스트\n');
        console.log('  geminiTest.validateKey()');
        console.log('    → API 키 유효성 검증\n');
        console.log('  geminiTest.ask("질문")');
        console.log('    → 간단한 질문 (예: geminiTest.ask("안녕하세요"))\n');
        console.log('  geminiTest.testMission()');
        console.log('    → 미션 생성 테스트\n');
        console.log('  geminiTest.models()');
        console.log('    → 사용 가능한 모델 목록 조회\n');
        console.log('  geminiTest.getApiKey()');
        console.log('    → 현재 설정된 API 키 확인 (마스킹)\n');
        console.log('  geminiTest.help()');
        console.log('    → 이 도움말 표시\n');
        console.log('═══════════════════════════════════════');
    }
};

// 전역 객체에 등록 (개발 환경에서만)
if (import.meta.env.DEV) {
    (window as any).geminiTest = geminiTest;
    console.log('\n💡 Gemini API 테스트 유틸리티가 로드되었습니다!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 빠른 시작: geminiTest.runAll()');
    console.log('📚 도움말: geminiTest.help()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
