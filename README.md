# 미래우주 홈페이지

우주·로켓·위성을 다루는 **미래우주**의 공식 홈페이지입니다.
Hugo + 직접 작성한 HTML/CSS/JS로 만든 정적 사이트(대학 홈페이지 형식)이며, 글쓰기는 Sveltia CMS(로컬 모드)로 합니다.

## 기술 스택

- **Hugo** (정적 사이트 생성기, 테마 없이 커스텀 레이아웃)
- **HTML / CSS / JS** (Hugo asset pipeline으로 번들·압축)
- **Sveltia CMS** (`/admin` 글쓰기 — 마크다운, 로컬 모드)
- **Cloudflare Pages** (배포, `git push` 시 자동 빌드·배포)

## 로컬에서 실행하기

```powershell
hugo server          # http://localhost:1313 (저장 시 자동 새로고침)
hugo --gc --minify   # 프로덕션 빌드 → public/
```

> Hugo가 없으면 설치 필요: <https://github.com/gohugoio/hugo/releases> 에서
> `hugo_extended_<버전>_windows-amd64.zip` 받아 `hugo.exe`를 PATH 폴더(예: `~/.local/bin`)에 두기.
> (이 PC에는 `~/.local/bin/hugo.exe` 로 설치되어 있음)

## 글쓰기 — 로컬 CMS (Sveltia)

공지/뉴스/활동/행사 글을 **브라우저 화면에서 마크다운**으로 작성합니다. 로컬 모드는 내 컴퓨터에서만 동작하고 인증이 필요 없습니다.

1. 개발 서버 실행: `hugo server`
2. **Chrome 또는 Edge**로 `http://localhost:1313/admin/` 접속
3. **"Work with Local Repository"** 클릭 → 이 프로젝트 폴더 선택
4. 왼쪽 분류(공지사항 / 최근 소식 / 세미나·교육 / 행사일정) 선택 → **New** → 제목·날짜·본문 작성 → 저장
   - 저장하면 `content/<분류>/…md` 파일이 자동 생성되고, 홈 "소식" 보드와 분류 목록 페이지에 자동 반영됩니다.
5. 작성이 끝나면 변경 파일을 **커밋·푸시** → 자동 배포

> 배포된 사이트에서 **여러 명(산학 협력체 등)이 온라인으로 작성**하려면, GitHub OAuth 앱 + 인증 Worker를 설정해 온라인 모드로 전환하면 됩니다. (지금은 로컬 모드)

글이 저장되는 위치: `content/notice` · `content/seminar` · `content/news` · `content/event`

## 폴더 구조

```
.
├── hugo.toml                 # 사이트 설정 (제목·설명·연락처·noindex 등)
├── data/
│   ├── gnb.yaml · hero.yaml  # 상단 메뉴 · 히어로 슬라이더
│   └── research · achievements · presentations · trends · albums · videos.yaml  # 연구·실적·학회 발표·동향·갤러리·동영상
├── content/
│   ├── _index.md             # 홈 "소개" 본문
│   ├── notice/ seminar/ news/ event/   # 분류별 글(.md)
│   └── …
├── layouts/
│   ├── _default/baseof.html · list.html · single.html
│   └── partials/
│       ├── head · header · footer · floating · icon
│       └── sections/         # hero · quick-links · research-highlights · stats-strip · trends · gallery-preview · videos · news-latest
├── assets/css/main.css       # 스타일 (:root 변수)
├── assets/js/main.js         # 인터랙션 (슬라이더·탭·메뉴)
├── static/
│   ├── admin/                # 글쓰기 CMS (index.html · config.yml)
│   ├── _headers              # Cloudflare 응답 헤더 (검색 차단)
│   └── favicon.svg
└── README.md
```

## 자주 수정하는 곳

| 바꾸고 싶은 것 | 위치 |
| --- | --- |
| 사이트 제목·설명·이메일·영문명 | `hugo.toml` `[params]` |
| 검색엔진 노출 차단 해제 | `hugo.toml` `noindex = false` (+ `static/_headers` 정리) |
| 상단 메뉴(GNB)·푸터 사이트맵 | `data/gnb.yaml` |
| 인사말(본문·직함·이름) | `content/greeting.md` |
| 논문·배출 인력·세미나·Lunar PNT 본문 | `content/research/publications.md` · `content/research/graduates.md` · `content/research/seminars.md` · `content/lunanet.md` (본문이 비어 있으면 "내용을 준비 중입니다." 표시) |
| 참여기관(전문·주관·공동·위탁연구기관 카드) | `layouts/_default/members.html` |
| 참여기관 페이지의 협력기관 로고 | `data/partners.yaml` (로고 이미지: `assets/img/partners/`) |
| 참여 연구진(역할·학교·학과·이름) | `data/researchers.yaml` (학교 로고: `assets/img/schools/`) |
| 히어로 슬라이드 | `data/hero.yaml` |
| 히어로 아래 바로가기 링크(센터 소개·최근 소식·국제 동향) | `layouts/partials/sections/quick-links.html` 맨 위 `$links` |
| 연구 분야 카드(홈·연구) | `data/research.yaml` |
| 연구 내용 > 전체 개요의 연구개요·연구계획 | `data/research_overview.yaml` (연구계획 그림: `assets/img/research/plan/`) |
| 세부 연구과제 자세히 페이지(글머리·그림) | `content/research/<과제>.md` 본문과 앞부분 `figure` (그림: `assets/img/research/detail/`) |
| 연구 실적 | `data/achievements.yaml` |
| 학회 발표 목록(연도별 자동 정렬) | `data/presentations.yaml` |
| 국제 동향(LunaNet 등) | `data/trends.yaml` |
| 사진 앨범(연구 실적 > 활동 페이지) | `data/albums.yaml` (이미지: `static/uploads/gallery/`) |
| 동영상 | `data/videos.yaml` |
| 공지·세미나·뉴스·행사 글 | `/admin` (CMS) 또는 `content/<분류>/*.md` |
| 색상·디자인 | `assets/css/main.css` (상단 `:root`) |
| 모션그래픽(연구·국제동향) | `layouts/partials/motion-slot.html` (현재 플레이스홀더, 2.5D 후속) |

## 배포 — Cloudflare Pages (Git 연동)

GitHub 레포가 Cloudflare Pages에 연결되어 있어, `main` 에 push하면 **Cloudflare가 Hugo를 빌드해 자동 배포**합니다. (별도 CI·시크릿 불필요)

**1회 설정** (Cloudflare 대시보드 → 프로젝트 → Settings → Builds & deployments → Build configuration)

| 항목 | 값 |
| --- | --- |
| Framework preset | Hugo |
| Build command | `hugo --gc --minify` |
| Build output directory | `public` |
| 환경 변수 | `HUGO_VERSION` = `0.163.2` |

수동 배포도 가능:

```powershell
hugo --gc --minify
npx wrangler pages deploy public --project-name=mirae-woojoo
```

> 현재 사이트는 `noindex`(검색엔진 비노출) 상태입니다. 공개 준비가 되면 `hugo.toml`의 `noindex`를 끄고 `static/_headers`를 정리하세요.
