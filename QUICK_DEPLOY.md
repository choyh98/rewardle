# 🚀 빠른 배포 가이드

## 📝 오늘 수정된 내용
1. ✅ Supabase에 게임 플레이 기록이 저장되지 않던 버그 수정
2. ✅ 게임 완료 후 추가 미션 팝업이 표시되지 않던 버그 수정

---

## 🎯 3단계로 배포하기

### 1단계: 코드 배포 (5분)

#### 옵션 A: 배치 파일 실행 (추천)
```cmd
deploy.bat
```
- 자동으로 git commit, push, vercel 배포 실행

#### 옵션 B: 수동 실행
```bash
git add .
git commit -m "fix: 버그 수정"
git push origin main
```

---

### 2단계: Supabase 정책 업데이트 (2분) ⭐ 필수!

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → SQL Editor
3. `supabase_policy_update.sql` 파일의 내용을 복사해서 붙여넣기
4. "Run" 버튼 클릭

**또는 간단하게:**
- `supabase_policy_update.sql` 파일 열기
- 전체 내용 복사 (Ctrl+A, Ctrl+C)
- Supabase SQL Editor에 붙여넣기 (Ctrl+V)
- Run 클릭

---

### 3단계: 배포 확인 (3분)

#### 자동 배포 확인
- Vercel 대시보드: https://vercel.com/dashboard
- "Deployments" 탭에서 배포 상태 확인
- 배포 완료까지 약 2-3분 소요

#### 테스트
1. 배포된 사이트 접속
2. 게임 플레이
3. F12 → Console에서 에러 없는지 확인
4. Supabase → Table Editor → game_plays 테이블에 데이터 저장되는지 확인

---

## 📋 배포 후 필수 테스트

### ✅ 체크리스트
- [ ] 로그인 (Google)
- [ ] 게임 플레이 (워들/사과)
- [ ] 게임 참여 횟수 1회 남았을 때 사과 게임 완료
  - [ ] "정답입니다" 팝업 표시
  - [ ] "추가미션하고 5P 더 받기" 버튼 클릭
  - [ ] 추가 미션 팝업 정상 표시
- [ ] Supabase game_plays 테이블에 데이터 저장됨

---

## 🆘 문제 해결

### 데이터가 저장되지 않는다면?
→ 2단계(Supabase 정책 업데이트)를 실행했는지 확인!

### 추가 미션 팝업이 안 뜨는 경우
→ 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

### Vercel 배포가 안 되는 경우
→ Vercel 대시보드에서 수동으로 "Redeploy" 클릭

---

## 📞 추가 도움말

- 상세 가이드: `DEPLOY_GUIDE.md`
- 테스트 체크리스트: `TEST_CHECKLIST.md`
- 환경 변수 설정: `ENV_SETUP.md`

---

**빠른 배포 끝! 수고하셨습니다!** 🎉
