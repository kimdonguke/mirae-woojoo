# 미래우주 홈페이지

우주, 로켓, 위성을 탐구하는 학회 **미래우주**의 공식 홈페이지입니다.
Hugo + 직접 작성한 HTML/CSS/JS로 만든 가벼운 원페이지 정적 사이트입니다.

## 기술 스택

- **Hugo** (정적 사이트 생성기, 테마 없이 커스텀 레이아웃)
- **HTML / CSS / JS** (Hugo asset pipeline으로 번들·압축)
- **Cloudflare Pages** (배포)

## 로컬에서 실행하기

### 1. Hugo 설치 (최초 1회)

Windows (PowerShell, winget):

```powershell
winget install Hugo.Hugo.Extended
```

> scoop 사용 시: `scoop install hugo-extended` / choco 사용 시: `choco install hugo-extended`
> 설치 후 새 터미널을 열고 `hugo version` 으로 확인하세요.

### 2. 개발 서버 실행

```powershell
hugo server -D
```

→ 브라우저에서 `http://localhost:1313` 접속. 파일을 저장하면 자동으로 새로고침됩니다.

### 3. 프로덕션 빌드

```powershell
hugo --gc --minify
```

→ 결과물이 `public/` 폴더에 생성됩니다.

## 폴더 구조

```
.
├── hugo.toml                  # 사이트 설정 (제목·메뉴·문구·연락처)
├── content/_index.md          # 홈 "학회 소개" 본문
├── layouts/
│   ├── _default/baseof.html   # 공통 골격 (head·nav·footer)
│   ├── index.html             # 원페이지 조립
│   └── partials/
│       ├── head.html · header.html · footer.html
│       └── sections/          # hero · about · activities · contact
├── assets/css/main.css        # 스타일
├── assets/js/main.js          # 인터랙션 (메뉴·스크롤)
└── static/favicon.svg
```

## 자주 수정하는 곳

| 바꾸고 싶은 것 | 수정할 파일 |
| --- | --- |
| 사이트 제목·설명·이메일·GitHub | `hugo.toml` `[params]` |
| 첫 화면(Hero) 문구 | `hugo.toml` `[params.hero]` |
| 활동 카드(로켓/위성/탐사) | `hugo.toml` `[[params.activities]]` |
| 상단 메뉴 | `hugo.toml` `[menu]` |
| "학회 소개" 본문 | `content/_index.md` |
| 색상·디자인 | `assets/css/main.css` (상단 `:root` 변수) |

## Cloudflare Pages 배포

GitHub 레포지토리를 연결한 뒤, Cloudflare Pages 대시보드에서 다음과 같이 설정합니다.

| 항목 | 값 |
| --- | --- |
| Framework preset | Hugo |
| Build command | `hugo --gc --minify` |
| Build output directory | `public` |
| 환경 변수 | `HUGO_VERSION` = (설치한 버전, 예: `0.148.0`) |

배포 후 발급되는 도메인(`*.pages.dev` 또는 연결한 커스텀 도메인)으로
`hugo.toml`의 `baseURL` 값을 바꿔주세요.
