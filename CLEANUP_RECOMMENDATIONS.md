# 🗑️ 안 쓰는 파일 및 정리 권장사항

## ❌ 삭제 권장 파일

### 1. 미사용 유틸리티
```
src/utils/commonUtils.ts
```
- 방금 생성했지만 어디에서도 import 되지 않음
- 사용하려면 각 서비스 파일에서 import 필요
- **조치:** 사용하지 않으면 삭제

### 2. 예시 파일 (선택적)
```
src/examples/onnuriApiExamples.ts
```
- 학습/참고용 예시 코드
- 실제 프로덕션 코드에서 미사용
- **조치:** 문서화 목적이면 유지, 아니면 삭제

### 3. 중복 Button 컴포넌트
```
src/components/common/Button.tsx ❌ 삭제 권장
src/components/ui/Button.tsx ✅ 사용 중 (WordleModals)
```
- 두 개의 Button 컴포넌트가 존재
- `common/Button.tsx`는 어디에서도 사용되지 않음
- **조치:** `common/Button.tsx` 삭제

### 4. 추가미션 폴더 (별도 프로젝트)
```
추가미션/
```
- 메인 프로젝트와 독립된 별도 React 앱
- 자체 package.json과 vite.config 보유
- 메인 프로젝트에서 사용되지 않음
- **조치:** 필요 없으면 폴더 전체 삭제

## ⚠️ 검토 필요 (중복 가능성)

### Modal 컴포넌트 중복
```
src/components/ui/Modal.tsx (사용: WordleModals)
src/components/common/Modal.tsx (사용: 여러 곳)
```
- 두 개의 Modal 컴포넌트 존재
- 기능이 유사할 가능성
- **조치:** 하나로 통합 검토

### WalkingMissionPage
```
src/components/common/WalkingMissionPage.tsx
```
- 3개 게임에서 import하지만 실제 렌더링 여부 불명확
- **조치:** 실제 사용 여부 확인 필요

## 🔧 정리 작업 제안

### 즉시 삭제 가능
```bash
# 1. 미사용 Button 삭제
rm src/components/common/Button.tsx

# 2. 미사용 유틸리티 삭제
rm src/utils/commonUtils.ts

# 3. 예시 파일 삭제 (선택)
rm src/examples/onnuriApiExamples.ts

# 4. 추가미션 폴더 삭제 (선택)
rm -rf 추가미션/
```

### 구조 개선 제안

#### 1. Button 컴포넌트 통합
```typescript
// 현재: 2개 존재
- src/components/ui/Button.tsx (더 기능 많음)
- src/components/common/Button.tsx (단순)

// 제안: ui/Button.tsx로 통합
export { Button } from './ui/Button';
```

#### 2. Modal 컴포넌트 통합
```typescript
// 현재: 2개 존재
- src/components/ui/Modal.tsx
- src/components/common/Modal.tsx

// 제안: common/Modal.tsx로 통합
// (더 많이 사용되는 쪽)
```

#### 3. 폴더 구조 정리
```
src/
├── components/
│   ├── common/    ← 공통 컴포넌트 (Button, Modal 등)
│   ├── games/     ← 게임 전용
│   └── ui/        ← ❌ 제거하고 common으로 통합
```

## 📊 파일 사용 현황

### ✅ 잘 사용되는 파일
- 모든 페이지 컴포넌트 (LoginPage, GamePage 등)
- 모든 게임 컴포넌트
- 모든 서비스 파일
- 모든 hooks

### ⚠️ 사용처가 적은 파일
- `ui/Button.tsx` - 1곳에서만 사용
- `ui/Modal.tsx` - 1곳에서만 사용
- `lib/services.ts` - re-export만 (직접 import 가능)

### ❌ 사용되지 않는 파일
- `utils/commonUtils.ts`
- `components/common/Button.tsx`
- `examples/onnuriApiExamples.ts` (문서용)

## 🎯 우선순위별 정리 작업

### P0 - 즉시 (안전하게 삭제 가능)
1. `src/components/common/Button.tsx` 삭제
2. `src/utils/commonUtils.ts` 삭제

### P1 - 검토 후
1. `추가미션/` 폴더 삭제 여부 결정
2. Button/Modal 컴포넌트 통합

### P2 - 선택적
1. `examples/` 폴더 삭제 여부 결정
2. `ui/` 폴더를 `common/`으로 통합
3. `lib/services.ts` 제거 (직접 import 사용)

## 💾 예상 용량 절약
- `추가미션/` 폴더: ~5-10MB (node_modules 포함 시)
- 중복 컴포넌트: ~5KB
- 미사용 파일들: ~10KB

총 예상 절약: ~5-10MB (주로 추가미션 폴더)

## ⚡ 정리 후 이점
1. 프로젝트 구조 명확화
2. 빌드 크기 감소 (미미하지만)
3. 개발자 혼란 감소 (중복 컴포넌트 제거)
4. 유지보수 용이성 향상
