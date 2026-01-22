/**
 * 날짜 관련 유틸리티 함수 모음
 */

// YYYY-MM-DD 형식의 문자열 반환 (UTC 기준이 아닌 로컬 기준)
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 어제 날짜 문자열 반환
export const getYesterdayDateString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateString(yesterday);
};

// 두 날짜 문자열(YYYY-MM-DD) 사이의 차이 일수 계산
export const getDayDifference = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 연속 출석 여부 확인
export const isConsecutive = (lastCheckDate: string, currentCheckDate: string): boolean => {
    if (!lastCheckDate) return false;

    const d1 = new Date(lastCheckDate);
    const d2 = new Date(currentCheckDate);

    // 시간 정보를 제거하고 날짜만 비교
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays === 1; // 정확히 하루 차이일 때만 연속
};
