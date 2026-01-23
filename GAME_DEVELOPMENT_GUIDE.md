# 🎮 리워들 게임 개발 가이드 (Game Development Guide)

이 문서는 '리워들' 플랫폼에 새로운 게이미피케이션 광고(게임)를 추가하기 위한 기술 가이드입니다.

---

## 1. 디렉토리 구조 (Directory Structure)

새로운 게임 `NewGame`을 추가할 때 다음과 같은 구조를 권장합니다.

```text
src/
├── components/
│   └── games/
│       ├── newgame/              # NewGame 전용 UI 컴포넌트 폴더
│       │   ├── NewGameGrid.tsx    # 메인 게임 판
│       │   ├── NewGameModals.tsx  # 성공/실패/도움말 모달
│       │   └── ...
│       └── NewGame.tsx           # 게임 메인 컨테이너 (Entry Point)
├── hooks/
│   └── useNewGame.ts             # 게임 로직 및 상태 관리 (Custom Hook)
└── pages/
    └── GamePage.tsx              # 게임 라우팅 등록
```

---

## 2. 주요 구현 단계 (Implementation Steps)

### Step 1: 커스텀 훅 작성 (`src/hooks/useNewGame.ts`)
게임의 엔진 역할을 하는 훅입니다. 상태(점수, 시간, 진행 상황)를 관리합니다.

- **필수 포함 요소:**
    - `timeLeft`: 광고주가 요구하는 체류 시간을 위한 타이머.
    - `gameState`: 'playing', 'success', 'fail' 등의 상태.
    - `onComplete`: 게임 종료 시 포인트를 지급하는 콜백 함수.

### Step 2: 메인 컴포넌트 작성 (`src/components/games/NewGame.tsx`)
훅과 UI 컴포넌트를 결합합니다.

- **Props 인터페이스:**
```typescript
interface NewGameProps {
    brand: Brand;           // 브랜드 데이터 (로고, 미션 단어 등)
    onComplete: (points: number) => void;
    onBack: () => void;
    onDeductPlay: () => void; // 일일 플레이 횟수 차감
}
```

### Step 3: 미션 및 리워드 로직 연결
리워들은 단순한 게임이 아니라 **'광고'**입니다. 다음 요소를 반드시 포함해야 합니다.

1.  **시작 화면 (Start Screen):** 게임 방법 설명 및 '게임 시작' 버튼.
2.  **브랜드 각인 요소:** 게임 내에서 브랜드 이름이나 로고가 지속적으로 노출되어야 함.
3.  **미션 모달 (Mission Modal):** 게임 클리어 후 브랜드와 관련된 간단한 퀴즈나 액션 유도.
4.  **포인트 지급:** `onComplete(points)` 호출을 통해 `PointsContext`에 포인트 기록.

### Step 4: 라우팅 등록 (`src/pages/GamePage.tsx`)
새 게임이 URL을 통해 접근 가능하도록 추가합니다.

```tsx
// src/pages/GamePage.tsx
if (type === 'newgame') {
    return <NewGame brand={brand} onComplete={handleComplete} onBack={handleBack} onDeductPlay={handleDeductPlay} />;
}
```

---

## 3. 리워들 게임 개발 체크리스트 (Checklist)

- [ ] **체류 시간:** 유저가 평균 45~60초 이상 머물 수 있는 난이도인가?
- [ ] **모바일 최적화:** `touch-none` 속성 및 모바일 터치 이벤트(`onTouchStart` 등)를 처리했는가?
- [ ] **브랜드 연동:** `brand.name`이나 `brand.colors`를 UI에 반영했는가?
- [ ] **데이터 무결성:** 게임 횟수 차감(`onDeductPlay`)이 정확한 시점에 일어나는가?
- [ ] **성공/실패 모달:** 유저에게 명확한 보상 피드백을 주는가?

---

## 4. 참고할 파일
가장 표준적인 구조로 작성된 다음 파일들을 참고하세요.
- `src/components/games/AppleGame.tsx`
- `src/hooks/useAppleGame.ts`
- `src/components/games/apple/AppleModals.tsx`
