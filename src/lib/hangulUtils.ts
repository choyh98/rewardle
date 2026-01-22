/**
 * 한글 문자열에서 초성을 추출하는 유틸리티
 */

const CHO_SUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 한 글자의 초성을 추출합니다.
 */
export const getInitialConsonant = (char: string): string => {
    const code = char.charCodeAt(0) - 44032;
    if (code > -1 && code < 11172) {
        return CHO_SUNG[Math.floor(code / 588)];
    }
    return char; // 한글이 아닌 경우 그대로 반환
};

/**
 * 문자열 전체에서 초성 배열을 추출합니다.
 */
export const getInitialConsonants = (str: string | string[]): string[] => {
    const target = Array.isArray(str) ? str : str.split('');
    return target.map(getInitialConsonant);
};
