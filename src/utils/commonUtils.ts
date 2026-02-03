/**
 * 공통 유틸리티 함수
 */

/**
 * RPC 응답 데이터 검증
 */
export function validateRpcResponse<T>(
    data: T[] | null,
    errorMessage: string = '처리에 실패했습니다.'
): T {
    if (!data || data.length === 0) {
        throw new Error(errorMessage);
    }
    return data[0];
}

/**
 * 옵셔널 체이닝 결과에 기본값 제공
 */
export function getOrDefault<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue;
}

/**
 * 배열 길이 안전하게 가져오기
 */
export function safeLength(arr: any[] | null | undefined): number {
    return arr?.length || 0;
}

/**
 * 에러 메시지 추출 (기본값 포함)
 */
export function getErrorMessage(
    error: any,
    defaultMessage: string = '알 수 없는 오류가 발생했습니다.'
): string {
    return error?.message || error?.error?.message || defaultMessage;
}
