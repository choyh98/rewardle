# 추가 미션 시스템 (도보 미션) 통합 가이드

## 🎯 완료된 작업

### 1. 타입 정의 (`src/types/index.ts`)
- ✅ `MissionType`: 'quiz' | 'walking' | 'hybrid'
- ✅ `WalkingMissionData`: 도보 미션 데이터 구조
- ✅ `AIAnalysisResult`: AI 분석 결과
- ✅ `MissionData`: 통합 미션 데이터

### 2. AI 서비스 (`src/services/aiMissionService.ts`)
- ✅ `analyzePlaceWithAI()`: Gemini AI로 매장 분석
- ✅ 3개의 SEO 키워드 후보 생성
- ✅ 출발지, 도보 시간 자동 계산

### 3. 도보 미션 UI (`src/components/common/WalkingMissionModal.tsx`)
- ✅ 토스 스타일 3단계 플로우
- ✅ Step 1: 키워드 복사
- ✅ Step 2: 지도 열고 정답 입력
- ✅ Step 3: Confetti 효과 + 완료

### 4. Supabase 스키마 (`supabase_add_mission_system.sql`)
- ✅ `mission_type` 컬럼 추가
- ✅ `mission_data` JSONB 컬럼 추가
- ✅ 기존 데이터 자동 마이그레이션

## 📦 필수 패키지 설치

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

## 🚀 사용 방법

### 1단계: Supabase 스키마 적용

```sql
-- supabase_add_mission_system.sql 실행
-- Supabase Dashboard → SQL Editor에서 실행
```

### 2단계: 환경 변수 설정

`.env` 파일에 Gemini API 키 추가:
```env
VITE_GEMINI_API_KEY=AIzaSyDNovfloH3x01CX1HLi0gW3YxtiibNEXJk
```

### 3단계: 게임에서 사용

```typescript
import { MissionModal, WalkingMissionModal } from '../common';

// 퀴즈 미션 (기존과 동일)
<MissionModal
    question={brand.placeQuiz.question}
    placeUrl={brand.placeUrl}
    bonusPoints={5}
    onHome={() => onBack()}
    onSubmit={handleMissionSubmit}
/>

// 도보 미션 (새로운!)
{brand.mission?.type === 'walking' && (
    <WalkingMissionModal
        walkingData={brand.mission.walking!}
        placeUrl={brand.placeUrl}
        bonusPoints={brand.mission.bonusPoints}
        onHome={() => onBack()}
        onSubmit={(answer) => {
            const correct = answer.includes(brand.mission!.walking!.walkingTime.replace('분', ''));
            if (correct) {
                addPoints(brand.mission!.bonusPoints, '도보 미션 완료');
                return true;
            }
            return false;
        }}
    />
)}
```

## 🎨 AdminDashboard 통합 (다음 단계)

### AI 미션 생성 플로우:

1. **매장 정보 입력**
   ```typescript
   storeName: "팻어케이크 잠실본점"
   address: "송파구" (선택)
   ```

2. **AI 분석 실행**
   ```typescript
   const result = await analyzePlaceWithAI({ storeName, address });
   // 3개 키워드 후보 제시
   ```

3. **사장님 검증 & 선택**
   - 각 키워드마다 [네이버에서 확인] 버튼
   - iframe으로 실제 검색 결과 미리보기
   - 원하는 키워드 선택

4. **미세 조정**
   - 키워드 직접 수정 가능
   - 출발지 변경 가능
   - 도보 시간 조정 가능

5. **Supabase 저장**
   ```typescript
   const missionData = {
       type: 'walking',
       walking: {
           seoKeyword: "선택된 키워드",
           startPoint: "한성대입구역 6번출구",
           walkingTime: "8분",
           quizQuestion: "도보로 몇 분 걸릴까요?",
           correctAnswer: "8분"
       },
       bonusPoints: 20
   };
   ```

## 📊 데이터 구조 예시

### Supabase `brands` 테이블:

```json
{
  "id": "uuid",
  "name": "팻어케이크 잠실본점",
  "mission_type": "walking",
  "mission_data": {
    "type": "walking",
    "walking": {
      "seoKeyword": "잠실 수제버터바 맛집",
      "startPoint": "잠실역 2번출구",
      "walkingTime": "5분",
      "quizQuestion": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
      "correctAnswer": "5분",
      "storeAddress": "서울시 송파구 ..."
    },
    "bonusPoints": 20
  },
  "place_url": "https://place.naver.com/..."
}
```

## 🎯 다음 작업

1. **AdminDashboard UI 개선** (옵션 4 하이브리드)
   - AI 분석 버튼
   - 3개 키워드 후보 표시
   - 실시간 검증 UI
   - 미세 조정 폼

2. **brands.ts 업데이트**
   - mission_data 파싱 로직
   - 레거시 placeQuiz와 호환

3. **게임별 통합**
   - WordleGame
   - AppleGame
   - ShootingWordle

원하시면 지금 바로 AdminDashboard UI 만들어드릴까요?
