# AI 미션 생성 가이드 🤖

> Gemini AI를 활용한 자동 미션 생성 시스템

## 📋 목차
- [개요](#개요)
- [주요 기능](#주요-기능)
- [설치 및 설정](#설치-및-설정)
- [사용 방법](#사용-방법)
- [API 테스트](#api-테스트)
- [문제 해결](#문제-해결)
- [기술 세부사항](#기술-세부사항)

---

## 개요

AI 미션 시스템은 Gemini API를 사용하여 매장 정보를 분석하고, 자동으로 SEO 최적화 키워드와 도보 미션을 생성합니다.

### 🎯 핵심 목표
1. **네이버 지도 노출 최적화**: 검색 시 실제로 매장이 지도에 나오는 키워드 생성
2. **정확한 도보 미션**: 네이버 지도 기준 실제 도보 시간 제공
3. **SEO 전략**: 경쟁력 있는 3가지 키워드 후보 제시

---

## 주요 기능

### ✨ 자동 생성 항목

#### 1. 매장 분석
- 매장의 핵심 특징 파악
- 네이버 검색 알고리즘 관점에서 분석
- 타겟 고객층 및 분위기 분석

#### 2. SEO 키워드 생성
```
예시:
- "성북동 수제버터바 카페"
- "한성대 힙한 카페"  
- "성북동 핸드드립 카페"
```

**키워드 생성 규칙:**
- ✅ 끝은 반드시 명사 (카페, 맛집, 식당, 바, 샵)
- ✅ [지역명] + [특징] + [카테고리] 구조
- ❌ 매장명 포함 금지
- ❌ 형용사로 끝나면 안 됨

#### 3. 도보 미션 생성
```json
{
  "start_point": "한성대입구역 6번출구",
  "selected_keyword": "성북동 수제버터바 카페",
  "quiz_question": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
  "correct_answer": "15분",
  "guide_text": "네이버 지도 앱에서 확인하세요."
}
```

---

## 설치 및 설정

### 1. Gemini API 키 발급

1. **Google AI Studio 접속**
   - https://aistudio.google.com/app/apikey

2. **API 키 발급**
   - "Create API Key" 클릭
   - 프로젝트 선택 또는 새로 생성
   - API 키 복사

3. **환경 변수 설정**
   ```bash
   # .env 파일
   VITE_GEMINI_API_KEY=AIza...your_api_key_here
   ```

4. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

### 2. 무료 요금제 제한

| 항목 | 제한 |
|------|------|
| **분당 요청 수** | 15개 |
| **일일 요청 수** | 1,500개 |
| **분당 토큰 수** | 1M 토큰 |
| **일일 토큰 수** | 무제한 |

⚠️ **주의:** 테스트 시 요청 제한을 초과하지 않도록 주의하세요!

---

## 사용 방법

### 관리자 대시보드에서 미션 생성

1. **Admin 페이지 접속** (`/admin`)

2. **"도보 미션 추가" 클릭**

3. **매장 정보 입력**
   ```
   매장명: 카페 썬더버드
   주소: 서울 성북구 성북로23길 34
   카테고리: 카페
   시그니처 메뉴: 수제 버터바, 핸드드립 커피
   한 줄 소개: 성북동 골목의 힙한 카페
   ```

4. **"AI 미션 생성" 클릭**

5. **생성 결과 확인 및 수정**
   - SEO 키워드 3개 중 1개 선택
   - 도보 시간 확인 (네이버 지도로 검증 권장)
   - 필요 시 수정

6. **"미션 저장" 클릭**

---

## API 테스트

개발 환경에서 브라우저 콘솔을 열고 테스트할 수 있습니다.

### 전체 테스트 실행
```javascript
geminiTest.runAll()
```

**출력:**
```
═══════════════════════════════════════
🚀 Gemini API 전체 테스트 시작
═══════════════════════════════════════

━━━ 1️⃣ API 키 검증 ━━━
✅ API 키 형식이 올바릅니다.

━━━ 2️⃣ 연결 테스트 ━━━
✅ Gemini API 연결 성공! (모델: gemini-2.0-flash)
응답: "OK"

━━━ 3️⃣ 간단한 질문 테스트 ━━━
💡 응답: 안녕하세요! 무엇을 도와드릴까요?

━━━ 4️⃣ 미션 생성 테스트 ━━━
✅ 미션 생성 성공!
```

### 개별 테스트

#### 1. API 연결 테스트
```javascript
geminiTest.connection()
```

#### 2. API 키 검증
```javascript
geminiTest.validateKey()
```

#### 3. 간단한 질문
```javascript
geminiTest.ask("안녕하세요!")
```

#### 4. 미션 생성 테스트
```javascript
geminiTest.testMission()
```

#### 5. 사용 가능한 모델 확인
```javascript
geminiTest.models()
```

#### 6. 도움말
```javascript
geminiTest.help()
```

---

## 문제 해결

### ❌ "API 키가 설정되지 않았습니다"

**원인:** `.env` 파일에 API 키가 없거나 잘못 입력됨

**해결:**
1. `.env` 파일 확인
2. `VITE_GEMINI_API_KEY=` 항목이 있는지 확인
3. API 키가 `AIza`로 시작하는지 확인
4. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

---

### ❌ "Gemini API 호출 실패"

**원인:** API 키가 만료되었거나 할당량 초과

**해결:**
1. API 키 재발급
   ```
   https://aistudio.google.com/app/apikey
   ```
2. 기존 키 삭제 후 새 키 생성
3. `.env` 파일 업데이트
4. 서버 재시작

---

### ❌ "JSON 파싱 실패"

**원인:** Gemini가 유효한 JSON을 생성하지 못함

**해결:**
```javascript
// 브라우저 콘솔에서 테스트
geminiTest.testMission()
```

응답이 정상인지 확인 후, 다시 시도

---

### ❌ "요청 제한 초과 (Rate Limit)"

**원인:** 무료 요금제 제한 (분당 15개 요청) 초과

**해결:**
1. 1분 대기 후 재시도
2. 캐시 활용 (동일한 매장은 30분간 캐시됨)
3. 유료 요금제 전환 고려

---

### ❌ "모든 모델 접근 실패"

**원인:** 네트워크 문제 또는 Gemini API 장애

**해결:**
1. 인터넷 연결 확인
2. Google AI Studio 상태 확인
3. 브라우저 콘솔에서 직접 테스트
   ```javascript
   geminiTest.connection()
   ```

---

## 기술 세부사항

### 아키텍처

```
Admin Dashboard
     ↓
  AI Mission Service (aiMissionService.ts)
     ↓
  Gemini API (다중 모델 폴백)
     ↓
  JSON 응답 파싱 및 검증
     ↓
  Supabase (walking_missions 테이블)
```

### 사용 모델 (폴백 순서)

1. `gemini-2.0-flash-exp` (최신 실험 모델)
2. `gemini-2.0-flash` (2.0 Flash 안정)
3. `gemini-1.5-flash` (1.5 Flash)
4. `gemini-1.5-pro` (1.5 Pro 고품질)

### 캐시 전략

- **TTL**: 30분
- **키**: 프롬프트 전체 내용
- **저장소**: 메모리 (Map)
- **목적**: API 요청 절약 및 응답 속도 향상

### 데이터 검증

생성된 AI 응답은 다음 항목을 검증합니다:

```typescript
✅ store_analysis.summary 존재
✅ store_analysis.vibe 존재
✅ seo_strategy.target_keywords 3개 이상
✅ user_mission 모든 필드 존재
✅ correct_answer가 "N분" 형식
✅ selected_keyword에 매장명 미포함
```

검증 실패 시 상세한 오류 메시지 제공

---

## 프롬프트 설계 원칙

### 1. 명확한 역할 부여
```
당신은 네이버 지도 SEO 전문가이자 도보 미션 설계자입니다.
```

### 2. 구체적인 규칙 제시
```
- 끝은 반드시 명사
- 매장명 절대 금지
- 도보 시간 과소평가 금지
```

### 3. 예시 제공
```
좋은 예: "성북동 수제버터바 카페"
나쁜 예: "성북동 예쁜" (형용사 끝)
```

### 4. JSON 형식 강제
```json
generationConfig: {
  responseMimeType: 'application/json'
}
```

### 5. 안전 필터 해제
```javascript
safetySettings: [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
]
```

---

## 성능 최적화

### 1. 다중 모델 폴백
- 첫 번째 모델 실패 시 자동으로 다음 모델 시도
- 최대 4개 모델까지 시도

### 2. 캐시 활용
- 동일한 매장은 30분간 캐시
- API 요청 절약

### 3. 상세한 로깅
```javascript
console.log('🔄 Gemini 모델 시도: gemini-2.0-flash');
console.log('✅ AI 분석 완료 (Gemini gemini-2.0-flash)');
console.log('📊 Gemini 응답:', data);
```

### 4. 에러 처리
- 각 단계별 구체적인 에러 메시지
- 해결 방법 안내
- 브라우저 콘솔 테스트 유틸리티

---

## 향후 개선 사항

### 단기 (1-2주)
- [ ] 네이버 플레이스 크롤링 연동 (실제 매장 정보 자동 수집)
- [ ] 미션 생성 히스토리 저장
- [ ] 생성된 키워드 효과 분석

### 중기 (1-2개월)
- [ ] A/B 테스트 (여러 키워드 중 가장 효과적인 것 선택)
- [ ] 미션 난이도 자동 조절
- [ ] 이미지 분석 추가 (매장 사진으로 분위기 파악)

### 장기 (3개월+)
- [ ] 자체 AI 모델 훈련 (SEO 키워드 특화)
- [ ] 실시간 네이버 검색 결과 확인
- [ ] 매장 방문 인증 연동

---

## 참고 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [네이버 지도 SEO 가이드](https://searchadvisor.naver.com/)

---

**Made with ❤️ by Rewardle Team**
