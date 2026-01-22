# 리워들 환경 변수 설정 가이드

## Supabase 설정

### 1. Supabase URL과 ANON KEY 가져오기

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Settings** → **API** 선택
4. 다음 값을 복사:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 2. .env 파일 생성

프로젝트 루트에 `.env` 파일을 만들고 다음 내용 추가:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 값 교체

위의 `your-project-id`와 `your-anon-key-here`를 실제 값으로 교체하세요.

## ⚠️ 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요**
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요
- `VITE_` 접두사는 **반드시** 필요합니다 (Vite 환경 변수 규칙)

## 예시

```env
# ✅ 올바른 예시
VITE_SUPABASE_URL=https://abcdefgh12345678.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ 잘못된 예시
SUPABASE_URL=...  # VITE_ 접두사 없음
```

## 환경 변수 확인

개발 서버 실행 후 브라우저 콘솔에서 확인:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```

undefined가 아닌 실제 URL이 출력되어야 합니다.
