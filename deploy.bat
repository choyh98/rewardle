@echo off
chcp 65001 > nul
echo ========================================
echo 리워들 배포 스크립트
echo ========================================
echo.

echo [1/4] Git 상태 확인 중...
git status
echo.

echo [2/4] 변경사항 커밋 중...
git add .
git commit -m "fix: Supabase 데이터 저장 및 게임 완료 팝업 버그 수정"
echo.

echo [3/4] GitHub에 푸시 중...
git push origin main
echo.

echo [4/4] Vercel 배포 중...
echo Vercel CLI가 설치되어 있다면 자동 배포됩니다.
echo 설치되지 않았다면 Vercel 대시보드에서 자동 배포를 확인하세요.
vercel --prod 2>nul || echo Vercel CLI가 설치되지 않았습니다. Vercel 대시보드에서 배포를 확인하세요.
echo.

echo ========================================
echo 배포 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. DEPLOY_GUIDE.md를 열어 Supabase 정책 업데이트 SQL 실행
echo 2. 배포된 사이트에서 테스트 진행
echo.
pause
