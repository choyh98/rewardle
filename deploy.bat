@echo off
chcp 65001 > nul
echo ========================================
echo 리워들 배포 스크립트
echo ========================================
echo.

echo [1/3] Git 변경사항 추가 중...
git add .
echo.

echo [2/3] 커밋 생성 중...
git commit -m "refactor: 코드 구조 개선 및 버그 수정"
echo.

echo [3/3] GitHub에 강제 푸시 중...
git push -f origin main
echo.

echo ========================================
echo 배포 완료!
echo ========================================
echo.
echo Vercel 자동 배포를 기다리세요 (2-3분 소요)
echo 배포 후 브라우저 캐시를 삭제하고 테스트하세요!
echo.
pause
