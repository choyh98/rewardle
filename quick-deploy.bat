@echo off
chcp 65001 >nul
echo ====================================
echo 리워들 배포 시작
echo ====================================
echo.

git add .
git commit -m "feat: wordle/attendance improvements"
git push origin main

echo.
echo ====================================
echo GitHub 푸시 완료!
echo Vercel에서 자동 배포 중...
echo ====================================
pause
