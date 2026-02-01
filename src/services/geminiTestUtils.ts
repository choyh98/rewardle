/**
 * Gemini API 테스트 및 디버깅 유틸리티
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
                message: 'API 키가 설정되지 않았습니다.',
            };
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            return {
                success: false,
                message: `API 에러 (${response.status}): ${errorData.error?.message || response.statusText}`,
                details: errorData,
            };
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            success: true,
            message: `✅ Gemini API 연결 성공! 응답: "${text.trim()}"`,
            details: data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: `네트워크 오류: ${error.message}`,
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
export async function testSimpleGeneration(prompt: string): Promise<{
    success: boolean;
    response?: string;
    message: string;
}> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                        maxOutputTokens: 500,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: `API 에러: ${errorData.error?.message || response.statusText}`,
            };
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            success: true,
            response: text,
            message: '응답 생성 성공',
        };
    } catch (error: any) {
        return {
            success: false,
            message: `오류: ${error.message}`,
        };
    }
}

/**
 * 브라우저 콘솔에서 사용할 수 있는 테스트 함수
 */
export const geminiTest = {
    // 연결 테스트
    async connection() {
        const result = await testGeminiConnection();
        console.log(result.message);
        if (result.details) {
            console.log('상세 정보:', result.details);
        }
        return result;
    },

    // API 키 검증
    validateKey(apiKey?: string) {
        const result = validateApiKey(apiKey);
        console.log(result.message);
        return result;
    },

    // 간단한 질문
    async ask(prompt: string) {
        console.log('질문:', prompt);
        const result = await testSimpleGeneration(prompt);
        console.log('결과:', result.message);
        if (result.response) {
            console.log('응답:', result.response);
        }
        return result;
    },

    // 사용 가능한 모델 목록
    async models() {
        const result = await listAvailableModels();
        console.log(result.message);
        if (result.models) {
            console.log('모델 목록:', result.models);
        }
        return result;
    },

    // 현재 API 키 확인
    getApiKey() {
        const masked = GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5);
        console.log('현재 API 키:', masked);
        return masked;
    },

    // 전체 테스트 실행
    async runAll() {
        console.log('=== Gemini API 전체 테스트 시작 ===\n');

        console.log('1. API 키 검증:');
        const keyValidation = this.validateKey();
        console.log('');

        if (!keyValidation.valid) {
            console.error('❌ API 키가 유효하지 않습니다. 테스트 중단.');
            return;
        }

        console.log('2. 연결 테스트:');
        const connection = await this.connection();
        console.log('');

        if (!connection.success) {
            console.error('❌ 연결 실패. 추가 테스트 중단.');
            return;
        }

        console.log('3. 간단한 질문 테스트:');
        await this.ask('안녕하세요!');
        console.log('');

        console.log('=== 테스트 완료 ===');
    }
};

// 전역 객체에 등록 (개발 환경에서만)
if (import.meta.env.DEV) {
    (window as any).geminiTest = geminiTest;
    console.log('💡 Gemini API 테스트 유틸리티가 로드되었습니다.');
    console.log('사용법: geminiTest.runAll() 또는 geminiTest.connection()');
}
