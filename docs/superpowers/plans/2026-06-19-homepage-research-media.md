# 연구·미디어 콘텐츠 확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 미래우주 홈페이지를 5탭(소개/연구/소식/갤러리·미디어/자료실) 구조로 확장하고, 연구 소개·실적·국제동향(LunaNet)·세미나 보드·사진 갤러리·동영상 섹션과 홈 요약 섹션을 추가한다.

**Architecture:** 테마 없는 Hugo 정적 사이트. 구조화 목록은 `data/*.yaml`, 게시판은 `content/<section>/*.md`, 레이아웃은 `layouts/_default/*.html`와 `layouts/partials/sections/*.html`. 인터랙션은 기존 `assets/js/main.js`의 guarded-IIFE 패턴에 추가. 모션그래픽 자리는 정적 플레이스홀더 partial로 예약(2.5D는 후속).

**Tech Stack:** Hugo extended 0.163.2, Go HTML templates, 순수 CSS/JS(무라이브러리), Sveltia CMS, Cloudflare Pages.

**Branch:** `feature/homepage-research-media` (이미 생성됨, spec 커밋 존재).

**Spec:** `docs/superpowers/specs/2026-06-19-homepage-research-media-expansion-design.md`

---

## 검증 방식 (이 스택의 TDD 대체)

테스트 프레임워크가 없으므로 각 태스크의 "red/green"은 빌드+출력 검증으로 한다.

- **빌드:** `hugo --gc --minify` (이 PC에서 `hugo`가 PATH에 없으면 `~/.local/bin/hugo.exe --gc --minify`). 경고는 무시하되 **ERROR는 실패**로 간주.
- **출력 검증:** 생성된 `public/`를 grep. 예) `grep -rl "마커" public/`.
- **로컬 미리보기:** `hugo server` → http://localhost:1313 .
- `public/`는 `.gitignore`에 있으니 커밋되지 않는다.
- **기존 무해 경고**(`.Site.Data ... deprecated`, `LF will be replaced by CRLF`)는 무시.

## 파일 구조 (생성/수정 책임)

**data/** — 콘텐츠 소스(교체 가능한 예시)
- `gnb.yaml` *(수정)* — 5탭
- `research.yaml` *(생성)* — 연구 분야 카드/목록
- `achievements.yaml` *(생성)* — 연구 실적 목록 + 지표 집계
- `trends.yaml` *(생성)* — 국제 동향 카드
- `videos.yaml` *(생성)* — 동영상(혼합)
- `albums.yaml` *(생성)* — 사진 앨범
- `highlights.yaml` *(삭제)* — research.yaml로 대체

**layouts/partials/** 
- `motion-slot.html` *(생성)* — 모션 슬롯 정적 플레이스홀더
- `sections/research-highlights.html` *(생성)* — 홈: 연구 분야 카드(.hl-card 재사용)+모션
- `sections/stats-strip.html` *(생성)* — 홈: 실적 지표(조건부)
- `sections/trends.html` *(생성)* — 홈+연구페이지: 동향 카드+모션
- `sections/gallery-preview.html` *(생성)* — 홈: 갤러리 미리보기
- `sections/videos.html` *(생성)* — 홈+갤러리페이지: 동영상
- `sections/news-latest.html` *(생성)* — 홈: 최근 소식(공지·세미나·행사 3열)
- `sections/highlights.html` *(삭제)*

**layouts/_default/**
- `research.html` *(생성)* — 연구 페이지(분야·실적·동향)
- `gallery.html` *(생성)* — 갤러리·미디어 페이지(앨범 그리드+동영상)
- `activities.html` *(삭제)* — research.html로 대체
- `list.html` *(수정)* — 보드 목록에 seminar 추가

**content/**
- `research.md` *(생성, activities.md 대체)* — `aliases: ["/activities/"]`
- `gallery.md` *(생성)*
- `seminar/_index.md` *(생성)*
- `activities.md` *(삭제)*

**assets/**
- `js/main.js` *(수정)* — 라이트박스 + 동영상 facade IIFE 추가
- `css/main.css` *(수정)* — 신규 섹션 스타일

**기타**
- `index.html` *(수정)* — 홈 섹션 조립
- `static/admin/config.yml` *(수정)* — seminar + 데이터 파일 컬렉션
- `README.md` *(수정)* — 구조·작성법 갱신

---

## Phase A — 내비게이션 & 모션 슬롯 기반

### Task 1: 5탭 GNB

**Files:**
- Modify: `data/gnb.yaml`

- [ ] **Step 1 (red): 마커 확인.** 빌드 후 GNB에 "갤러리·미디어"가 없음을 확인.

```bash
hugo --gc --minify
grep -rl "갤러리·미디어" public/index.html; echo "exit=$?"
```
Expected: 마커 없음(`exit=1`).

- [ ] **Step 2: `data/gnb.yaml` 전체 교체.**

```yaml
# 상단 GNB(글로벌 내비게이션) — 5개 탭. 클릭 시 해당 페이지로 이동.
- name: 소개
  url: "/about/"
- name: 연구
  url: "/research/"
- name: 소식
  url: "/notice/"
- name: 갤러리·미디어
  url: "/gallery/"
- name: 자료실
  url: "/resources/"
```

- [ ] **Step 3 (green): 빌드 + GNB 5탭 확인.**

```bash
hugo --gc --minify
grep -o '갤러리·미디어' public/index.html | head -1   # → 출력되면 성공
grep -c 'class="gnb-item"' public/index.html          # → 5
```
Expected: "갤러리·미디어" 출력, gnb-item 5개, 빌드 ERROR 없음.

- [ ] **Step 4: 커밋.**

```bash
git add data/gnb.yaml
git commit -m "feat: GNB 5탭 구조(연구·갤러리·미디어 추가)"
```

---

### Task 2: 모션 슬롯 플레이스홀더 partial + 스타일

연구/국제동향 섹션에 들어갈 모션 자리. 현재는 은은한 정적 SVG, `data-variant`로 후속 2.5D 종류를 표시(network=연구, beacon=국제동향).

**Files:**
- Create: `layouts/partials/motion-slot.html`
- Modify: `assets/css/main.css` (끝에 추가)

- [ ] **Step 1 (red):** partial이 없으니 아직 어디서도 호출되지 않음. 빌드만 통과 확인.

```bash
hugo --gc --minify; echo "build exit=$?"
```
Expected: 빌드 성공(이 태스크는 다음 태스크에서 호출됨, 여기선 파일+스타일만 추가).

- [ ] **Step 2: `layouts/partials/motion-slot.html` 생성.**

```go-html-template
{{- /* 모션 슬롯: 현재는 정적 플레이스홀더. 후속에서 주제 맞춤 2.5D로 교체.
       호출: {{ partial "motion-slot.html" (dict "variant" "network") }}
       variant: network(연구) | beacon(국제동향) | orbit(기본) */ -}}
{{- $variant := .variant | default "orbit" -}}
<div class="motion-slot" data-variant="{{ $variant }}" aria-hidden="true">
  <!-- TODO(2.5D): 연구 주제 리스트 확정 후 {{ $variant }} 모션그래픽으로 교체 -->
  <svg viewBox="0 0 220 160" class="motion-ph">
    <ellipse cx="110" cy="84" rx="80" ry="40" fill="none" stroke="currentColor" stroke-dasharray="4 8" opacity=".35"/>
    <ellipse cx="110" cy="84" rx="48" ry="24" fill="none" stroke="currentColor" stroke-dasharray="3 9" opacity=".25"/>
    <circle cx="110" cy="84" r="11" fill="currentColor" opacity=".5"/>
    <circle cx="30" cy="84" r="3.5" fill="currentColor" opacity=".6"/>
    <circle cx="190" cy="84" r="3" fill="currentColor" opacity=".45"/>
  </svg>
</div>
```

- [ ] **Step 3: `assets/css/main.css` 끝에 추가.**

```css

/* ── 모션 슬롯 (정적 플레이스홀더 · 후속 2.5D 교체) ── */
.motion-slot { color: #3b82f6; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.motion-slot .motion-ph { width: 100%; max-width: 260px; height: auto; }
.section-dark .motion-slot { color: #93b4f5; }
@media (prefers-reduced-motion: reduce) { .motion-slot { opacity: .8; } }
```

- [ ] **Step 4: 빌드 통과 + 커밋.**

```bash
hugo --gc --minify; echo "exit=$?"
git add layouts/partials/motion-slot.html assets/css/main.css
git commit -m "feat: 모션 슬롯 플레이스홀더 partial(+스타일)"
```
Expected: 빌드 성공.

---

## Phase B — 연구: 홈 하이라이트 · 실적 · 국제동향 · 연구 페이지

### Task 3: 연구 분야 데이터 + 홈 "연구 하이라이트"(기존 둘러보기 대체)

기존 `.hl-card`(좌우 지그재그 그라데이션 카드, 모바일 수정 완료)를 재사용한다.

**Files:**
- Create: `data/research.yaml`
- Create: `layouts/partials/sections/research-highlights.html`
- Modify: `layouts/index.html`
- Delete: `layouts/partials/sections/highlights.html`, `data/highlights.yaml`

- [ ] **Step 1 (red):** 홈에 연구 분야 마커가 아직 없음.

```bash
hugo --gc --minify
grep -rl "research-highlights" public/index.html; echo "exit=$?"
```
Expected: 없음(`exit=1`).

- [ ] **Step 2: `data/research.yaml` 생성** (예시 · 교체 가능). 카드 재사용을 위해 `url`·`theme` 포함.

```yaml
# 연구 분야 — 홈 "연구 하이라이트" 카드 + /research/ 분야 목록 공용.
# theme: a~d (카드 색), url: 연구 페이지 내 앵커.
- title: 위성항법(GNSS) 신호처리
  summary: GNSS 신호 수신·처리와 측위 정확도 향상을 다룹니다.
  url: /research/#fields
  theme: a
  tag: GNSS
- title: 우주 PNT·심우주 항법
  summary: 달·심우주 환경의 위치·항법·시각(PNT) 기술을 탐구합니다.
  url: /research/#fields
  theme: b
  tag: PNT
- title: 다중센서 융합 측위
  summary: GNSS와 관성·영상 센서를 융합한 견고한 측위를 연구합니다.
  url: /research/#fields
  theme: c
  tag: Fusion
- title: 무결성·이상검출
  summary: 항법 신뢰성을 위한 무결성 감시와 이상 검출을 다룹니다.
  url: /research/#fields
  theme: d
  tag: Integrity
```

- [ ] **Step 3: `layouts/partials/sections/research-highlights.html` 생성.** `.hl-card` 마크업 재사용 + 모션 슬롯(network).

```go-html-template
<section class="section" id="research-highlights">
  <div class="container">
    <header class="section-head reveal">
      <span class="section-num">·</span>
      <h2 class="section-title">연구 하이라이트</h2>
      <span class="section-kicker">Research</span>
    </header>

    <div class="hl-with-motion reveal">
      <div class="highlights">
        {{ range site.Data.research }}
        <a class="hl-card hl-{{ .theme | default "a" }}" href="{{ .url }}">
          <div class="hl-text">
            {{ with .tag }}<span class="hl-tag">{{ . }}</span>{{ end }}
            <h3 class="hl-title">{{ .title }}</h3>
            <p class="hl-desc">{{ .summary }}</p>
            <span class="hl-link">자세히</span>
          </div>
          <span class="hl-media"></span>
        </a>
        {{ end }}
      </div>
      {{ partial "motion-slot.html" (dict "variant" "network") }}
    </div>
  </div>
</section>
```

- [ ] **Step 4: `layouts/index.html` 수정** — highlights → research-highlights.

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
{{ end }}
```

- [ ] **Step 5: 옛 파일 삭제 + 스타일 보강.** `data/highlights.yaml`, `sections/highlights.html` 삭제. `assets/css/main.css` 끝에 태그/모션 레이아웃 보강 추가.

```bash
git rm data/highlights.yaml layouts/partials/sections/highlights.html
```

`assets/css/main.css` 끝에 추가:

```css

/* ── 연구 하이라이트 보강(태그 + 모션 동반 배치) ── */
.hl-tag { align-self: flex-start; font-size: .72rem; font-weight: 700; color: var(--primary); background: var(--bg-alt); border: 1px solid var(--border); border-radius: 999px; padding: 2px 10px; margin-bottom: 4px; }
.hl-with-motion { position: relative; }
.hl-with-motion .motion-slot { position: absolute; top: -84px; right: 0; width: 200px; opacity: .55; }
@media (max-width: 900px) { .hl-with-motion .motion-slot { display: none; } }
```

- [ ] **Step 6 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -c 'class="hl-card' public/index.html      # → 4
grep -o '연구 하이라이트' public/index.html | head -1
grep -o 'data-variant="network"' public/index.html | head -1
```
Expected: hl-card 4개, "연구 하이라이트"·network 슬롯 출력, 빌드 ERROR 없음.

- [ ] **Step 7: 커밋.**

```bash
git add -A
git commit -m "feat: 홈 연구 하이라이트(둘러보기 대체) + 연구 분야 데이터 + 모션 슬롯"
```

---

### Task 4: 연구 실적 데이터 + 홈 지표 스트립(조건부)

**Files:**
- Create: `data/achievements.yaml`
- Create: `layouts/partials/sections/stats-strip.html`
- Modify: `layouts/index.html`, `assets/css/main.css`

- [ ] **Step 1 (red):** 홈에 지표 스트립 마커 없음.

```bash
hugo --gc --minify; grep -rl "stats-strip" public/index.html; echo "exit=$?"
```
Expected: 없음(`exit=1`).

- [ ] **Step 2: `data/achievements.yaml` 생성** (예시 · 교체 가능).

```yaml
# 연구 실적 — /research/ 목록 + 홈 지표 스트립 집계 소스.
# type: 논문 | 프로젝트 | 발표 | 특허
- { year: 2026, type: 논문,   title: "도심 환경 GNSS 다중경로 완화 기법", venue: 한국항법학회지, url: "" }
- { year: 2026, type: 발표,   title: "달 표면 PNT 상호운용 시나리오", venue: 항법학회 춘계학술대회, url: "" }
- { year: 2025, type: 프로젝트, title: "다중센서 융합 측위 시작품 개발", venue: 정부 R&D, url: "" }
- { year: 2025, type: 논문,   title: "항법 무결성 감시 알고리즘", venue: 국제학술지, url: "" }
- { year: 2024, type: 특허,   title: "이상신호 검출 장치 및 방법", venue: 등록특허, url: "" }
```

- [ ] **Step 3: `layouts/partials/sections/stats-strip.html` 생성.** 데이터 있을 때만 렌더, type별 카운트 집계.

```go-html-template
{{ $items := site.Data.achievements }}
{{ if $items }}
{{ $types := slice "논문" "프로젝트" "발표" "특허" }}
<section class="section section-tight" id="stats-strip">
  <div class="container">
    <ul class="stats-strip reveal">
      {{ range $t := $types }}
      {{ $n := len (where $items "type" $t) }}
      {{ if gt $n 0 }}
      <li class="stat"><span class="stat-num">{{ $n }}</span><span class="stat-label">{{ $t }}</span></li>
      {{ end }}
      {{ end }}
      <li class="stat"><span class="stat-num">{{ len $items }}</span><span class="stat-label">전체 실적</span></li>
    </ul>
  </div>
</section>
{{ end }}
```

- [ ] **Step 4: `layouts/index.html`에 삽입** (연구 하이라이트 다음).

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
{{ end }}
```

- [ ] **Step 5: `assets/css/main.css` 끝에 추가.**

```css

/* ── 실적 지표 스트립 ── */
.section-tight { padding: 30px 0; }
.stats-strip { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 14px; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 18px 12px; background: var(--bg-alt); border: 1px solid var(--border); border-radius: 14px; }
.stat-num { font-size: 1.9rem; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
.stat-label { font-size: .85rem; color: var(--text-muted); font-weight: 600; }
```

- [ ] **Step 6 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -o 'class="stats-strip"' public/index.html | head -1
grep -c 'class="stat"' public/index.html    # → type 개수 + 전체(예: 5)
```
Expected: 스트립 렌더, 빌드 ERROR 없음.

- [ ] **Step 7: 커밋.**

```bash
git add -A
git commit -m "feat: 연구 실적 데이터 + 홈 지표 스트립(조건부 렌더)"
```

---

### Task 5: 국제 동향 데이터 + 동향 섹션(홈 + 연구 페이지 재사용)

**Files:**
- Create: `data/trends.yaml`
- Create: `layouts/partials/sections/trends.html`
- Modify: `layouts/index.html`, `assets/css/main.css`

- [ ] **Step 1 (red):** 홈에 동향 마커 없음.

```bash
hugo --gc --minify; grep -rl "trends-section" public/index.html; echo "exit=$?"
```
Expected: 없음(`exit=1`).

- [ ] **Step 2: `data/trends.yaml` 생성** (예시 · 교체 가능).

```yaml
# 국제 동향 — 우주 PNT 국제 프로그램 카드.
- title: "LunaNet — 달 통신·항법 아키텍처"
  summary: 달 표면·궤도에서의 PNT·통신 상호운용 프레임워크.
  source: NASA / ESA
  url: "https://www.nasa.gov/communicating-with-missions/lunanet/"
  tag: 달 PNT
- title: "Moonlight — 달 통신·항법 이니셔티브"
  summary: 달 임무를 위한 통신·항법 인프라 구축 프로그램.
  source: ESA
  url: "https://www.esa.int"
  tag: 달 인프라
- title: "고궤도 GNSS 활용(SSV)"
  summary: 정지궤도 이상 고도에서의 GNSS 신호 활용 표준화 동향.
  source: 국제 표준
  url: ""
  tag: 우주 GNSS
```

- [ ] **Step 3: `layouts/partials/sections/trends.html` 생성.** `dict "heading"`로 제목, `dict "limit"`로 개수 제한(홈), `dict "background"`로 다크 배경. 모션 슬롯(beacon).

```go-html-template
{{- $heading := .heading | default "국제 동향" -}}
{{- $limit := .limit | default 0 -}}
{{- $items := site.Data.trends -}}
{{- if gt $limit 0 }}{{ $items = first $limit $items }}{{ end -}}
<section class="section trends-section{{ if .background }} section-dark{{ end }}" id="trends">
  <div class="container">
    <header class="section-head reveal">
      <span class="section-num">·</span>
      <h2 class="section-title">{{ $heading }}</h2>
      <span class="section-kicker">Global · LunaNet</span>
    </header>

    <div class="trends-wrap reveal">
      {{ partial "motion-slot.html" (dict "variant" "beacon") }}
      <ul class="trend-cards">
        {{ range $items }}
        <li class="trend-card">
          {{ with .tag }}<span class="trend-tag">{{ . }}</span>{{ end }}
          <h3 class="trend-title">{{ .title }}</h3>
          <p class="trend-desc">{{ .summary }}</p>
          <div class="trend-foot">
            {{ with .source }}<span class="trend-source">{{ . }}</span>{{ end }}
            {{ with .url }}<a class="trend-link" href="{{ . }}" target="_blank" rel="noopener">바로가기 ↗</a>{{ end }}
          </div>
        </li>
        {{ end }}
      </ul>
    </div>
    {{ if gt $limit 0 }}<p class="section-foot"><a href="/research/#trends">국제 동향 더보기 →</a></p>{{ end }}
  </div>
</section>
```

- [ ] **Step 4: `layouts/index.html`에 삽입** (홈은 limit 3 + 다크 배경).

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
  {{ partial "sections/trends.html" (dict "heading" "국제 동향 · LunaNet" "limit" 3 "background" true) }}
{{ end }}
```

- [ ] **Step 5: `assets/css/main.css` 끝에 추가.**

```css

/* ── 국제 동향 ── */
.section-dark { background: var(--ink); color: #cbd5e6; }
.section-dark .section-title { color: #fff; }
.trends-wrap { position: relative; }
.trends-wrap .motion-slot { position: absolute; top: -70px; right: 6px; width: 180px; opacity: .5; }
@media (max-width: 900px){ .trends-wrap .motion-slot { display: none; } }
.trend-cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
.trend-card { display: flex; flex-direction: column; gap: 10px; padding: 22px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 14px; }
.section:not(.section-dark) .trend-card { background: #fff; border-color: var(--border); }
.trend-tag { align-self: flex-start; font-size: .72rem; font-weight: 700; color: #93b4f5; background: rgba(147,180,245,.12); border-radius: 999px; padding: 2px 10px; }
.section:not(.section-dark) .trend-tag { color: var(--primary); background: var(--bg-alt); }
.trend-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: inherit; }
.section-dark .trend-title { color: #fff; }
.trend-desc { margin: 0; flex: 1; font-size: .92rem; line-height: 1.6; color: inherit; opacity: .9; }
.trend-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: .82rem; }
.trend-source { color: inherit; opacity: .7; font-weight: 600; }
.trend-link { color: #93b4f5; font-weight: 700; }
.section:not(.section-dark) .trend-link { color: var(--primary); }
.section-foot { margin: 22px 0 0; text-align: right; }
.section-foot a { font-weight: 700; color: inherit; }
```

- [ ] **Step 6 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -o 'class="trend-card"' public/index.html | wc -l    # → 3 (홈 limit)
grep -o 'data-variant="beacon"' public/index.html | head -1
```
Expected: 홈 동향 카드 3개 + beacon 슬롯, 빌드 ERROR 없음.

- [ ] **Step 7: 커밋.**

```bash
git add -A
git commit -m "feat: 국제 동향(LunaNet) 데이터 + 동향 섹션(홈 다크) + 모션 슬롯"
```

---

### Task 6: 연구 페이지(분야·실적·동향) + activities 대체

**Files:**
- Create: `layouts/_default/research.html`
- Create: `content/research.md`
- Delete: `layouts/_default/activities.html`, `content/activities.md`
- Modify: `assets/css/main.css`

- [ ] **Step 1 (red):** `/research/` 가 아직 없음.

```bash
hugo --gc --minify; ls public/research/index.html 2>&1; echo "exit=$?"
```
Expected: 없음.

- [ ] **Step 2: `content/research.md` 생성** (activities 대체, alias).

```markdown
---
title: "연구"
kicker: "RESEARCH"
layout: research
aliases: ["/activities/"]
---

미래우주의 연구 분야와 실적, 국제 동향을 소개합니다.
```

- [ ] **Step 3: `layouts/_default/research.html` 생성.** 분야 카드(research.yaml) + 실적 목록(achievements.yaml, 연도 내림차순) + 동향(trends.html 재사용).

```go-html-template
{{ define "main" }}
{{ partial "page-hero.html" . }}
<section class="section">
  <div class="container narrow">
    {{ with .Content }}<div class="prose" style="margin-bottom:28px">{{ . }}</div>{{ end }}

    <div id="fields" class="page-section">
      <h2 class="page-h2">연구 분야</h2>
      <div class="field-grid">
        {{ range site.Data.research }}
        <div class="field-card">
          {{ with .tag }}<span class="field-tag">{{ . }}</span>{{ end }}
          <h3 class="field-title">{{ .title }}</h3>
          <p class="field-desc">{{ .summary }}</p>
        </div>
        {{ end }}
      </div>
    </div>

    <div id="achievements" class="page-section">
      <h2 class="page-h2">연구 실적</h2>
      {{ $items := sort site.Data.achievements "year" "desc" }}
      {{ if $items }}
      <ul class="ach-list">
        {{ range $items }}
        <li class="ach-row">
          <span class="ach-year">{{ .year }}</span>
          <span class="ach-type">{{ .type }}</span>
          <span class="ach-main">
            {{ if .url }}<a href="{{ .url }}" target="_blank" rel="noopener">{{ .title }}</a>{{ else }}{{ .title }}{{ end }}
            {{ with .venue }}<span class="ach-venue">· {{ . }}</span>{{ end }}
          </span>
        </li>
        {{ end }}
      </ul>
      {{ else }}
      <p class="page-empty">등록된 실적이 아직 없습니다.</p>
      {{ end }}
    </div>
  </div>
</section>

{{ partial "sections/trends.html" (dict "heading" "국제 동향" "background" false) }}
{{ end }}
```

- [ ] **Step 4: 옛 파일 삭제 + 스타일 추가.**

```bash
git rm layouts/_default/activities.html content/activities.md
```

`assets/css/main.css` 끝에 추가:

```css

/* ── 연구 페이지 ── */
.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.field-card { padding: 20px; background: #fff; border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; gap: 8px; }
.field-tag { align-self: flex-start; font-size: .72rem; font-weight: 700; color: var(--primary); background: var(--bg-alt); border-radius: 999px; padding: 2px 10px; }
.field-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--ink); }
.field-desc { margin: 0; font-size: .92rem; line-height: 1.6; color: var(--text-muted); }
.ach-list { list-style: none; margin: 0; padding: 0; }
.ach-row { display: grid; grid-template-columns: 58px 64px 1fr; gap: 12px; align-items: baseline; padding: 13px 4px; border-bottom: 1px solid var(--border); }
.ach-year { font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
.ach-type { font-size: .78rem; font-weight: 700; color: var(--text-muted); background: var(--bg-alt); border-radius: 999px; padding: 2px 0; text-align: center; }
.ach-main { color: var(--ink); line-height: 1.5; }
.ach-venue { color: var(--text-muted); font-size: .9rem; }
@media (max-width: 560px){ .ach-row { grid-template-columns: 48px 56px 1fr; } }
```

- [ ] **Step 5 (green): 빌드 + 검증** (페이지 생성 + alias + 실적 정렬).

```bash
hugo --gc --minify
grep -o '연구 분야' public/research/index.html | head -1
grep -c 'class="ach-row"' public/research/index.html      # → 5
ls public/activities/index.html                            # alias 존재
grep -o '연구 분야' public/research/index.html | head -1
```
Expected: `/research/` 렌더, ach-row 5개, `/activities/` alias 페이지 생성, 빌드 ERROR 없음.

- [ ] **Step 6: 커밋.**

```bash
git add -A
git commit -m "feat: 연구 페이지(분야·실적·동향) + /activities/ → /research/ 대체"
```

---

## Phase C — 소식: 세미나 보드 & 홈 최근 소식

### Task 7: 세미나·교육 보드

**Files:**
- Create: `content/seminar/_index.md`
- Modify: `layouts/_default/list.html`

- [ ] **Step 1 (red):** `/seminar/` 없음.

```bash
hugo --gc --minify; ls public/seminar/index.html 2>&1; echo "exit=$?"
```
Expected: 없음.

- [ ] **Step 2: `content/seminar/_index.md` 생성.**

```markdown
---
title: "세미나·교육"
---
```

- [ ] **Step 3: `layouts/_default/list.html` 수정** — 보드 목록·내비에 seminar 추가. 5번째 줄과 board-nav를 교체.

치환 1 — 보드 슬라이스:
```go-html-template
    {{ $boards := slice "notice" "seminar" "news" "event" }}
```

치환 2 — `<nav class="board-nav">` 블록 전체:
```go-html-template
    <nav class="board-nav" aria-label="소식 분류">
      <a href="/notice/"{{ if eq .Section "notice" }} class="is-active"{{ end }}>공지사항</a>
      <a href="/seminar/"{{ if eq .Section "seminar" }} class="is-active"{{ end }}>세미나·교육</a>
      <a href="/news/"{{ if eq .Section "news" }} class="is-active"{{ end }}>뉴스</a>
      <a href="/event/"{{ if eq .Section "event" }} class="is-active"{{ end }}>행사일정</a>
    </nav>
```

- [ ] **Step 4 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
ls public/seminar/index.html
grep -o '세미나·교육' public/notice/index.html | head -1    # 보드 내비에 노출
```
Expected: `/seminar/` 생성 + 보드 내비에 "세미나·교육" 링크, 빌드 ERROR 없음.

- [ ] **Step 5: 커밋.**

```bash
git add -A
git commit -m "feat: 세미나·교육 보드(/seminar/) + 소식 보드 내비 추가"
```

---

### Task 8: 홈 "최근 소식"(공지·세미나·행사 3열)

**Files:**
- Create: `layouts/partials/sections/news-latest.html`
- Modify: `layouts/index.html`, `assets/css/main.css`

- [ ] **Step 1 (red):** 홈에 최근 소식 마커 없음.

```bash
hugo --gc --minify; grep -rl "news-latest" public/index.html; echo "exit=$?"
```
Expected: 없음(`exit=1`).

- [ ] **Step 2: `layouts/partials/sections/news-latest.html` 생성.** 3개 섹션 최신 4건씩, 기존 `.post-list` 재사용.

```go-html-template
{{ $cols := slice
  (dict "title" "공지사항" "url" "/notice/" "pages" (where site.RegularPages "Section" "notice"))
  (dict "title" "세미나·교육" "url" "/seminar/" "pages" (where site.RegularPages "Section" "seminar"))
  (dict "title" "행사일정" "url" "/event/" "pages" (where site.RegularPages "Section" "event"))
}}
<section class="section" id="news-latest">
  <div class="container">
    <header class="section-head reveal">
      <span class="section-num">·</span>
      <h2 class="section-title">최근 소식</h2>
      <span class="section-kicker">News</span>
    </header>
    <div class="news-cols reveal">
      {{ range $cols }}
      <div class="news-col">
        <div class="news-col-head">
          <h3>{{ .title }}</h3>
          <a href="{{ .url }}" class="news-more">더보기</a>
        </div>
        <ul class="post-list">
          {{ range first 4 (.pages.ByDate.Reverse) }}
          <li class="post-row">
            <a href="{{ .RelPermalink }}">
              <span class="post-title">{{ .Title }}</span>
              <time class="post-date">{{ .Date.Format "2006-01-02" }}</time>
            </a>
          </li>
          {{ else }}
          <li class="post-empty">아직 등록된 글이 없습니다.</li>
          {{ end }}
        </ul>
      </div>
      {{ end }}
    </div>
  </div>
</section>
```

- [ ] **Step 3: `layouts/index.html`에 삽입** (동향 다음).

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
  {{ partial "sections/trends.html" (dict "heading" "국제 동향 · LunaNet" "limit" 3 "background" true) }}
  {{ partial "sections/news-latest.html" . }}
{{ end }}
```

- [ ] **Step 4: `assets/css/main.css` 끝에 추가.**

```css

/* ── 홈 최근 소식(3열) ── */
.news-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.news-col-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 6px; }
.news-col-head h3 { margin: 0; font-size: 1.02rem; font-weight: 800; color: var(--ink); }
.news-more { font-size: .82rem; font-weight: 700; color: var(--text-muted); }
.news-more:hover { color: var(--primary); }
@media (max-width: 860px){ .news-cols { grid-template-columns: 1fr; gap: 20px; } }
```

- [ ] **Step 5 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -c 'class="news-col"' public/index.html     # → 3
grep -o '최근 소식' public/index.html | head -1
```
Expected: news-col 3개 + "최근 소식", 빌드 ERROR 없음.

- [ ] **Step 6: 커밋.**

```bash
git add -A
git commit -m "feat: 홈 최근 소식 3열(공지·세미나·행사)"
```

---

## Phase D — 갤러리·미디어

### Task 9: 갤러리 페이지 + 앨범 데이터 + 사진 그리드

**Files:**
- Create: `data/albums.yaml`, `content/gallery.md`, `layouts/_default/gallery.html`
- Modify: `assets/css/main.css`

- [ ] **Step 1 (red):** `/gallery/` 없음.

```bash
hugo --gc --minify; ls public/gallery/index.html 2>&1; echo "exit=$?"
```
Expected: 없음.

- [ ] **Step 2: `data/albums.yaml` 생성** (예시 · 이미지 경로는 placeholder, CMS 업로드 시 교체).

```yaml
# 사진 앨범 — 현장 실무교육·행사. 이미지는 static/uploads/gallery/ 에 업로드.
- slug: field-training-2026
  title: 현장 실무교육
  date: 2026-05
  photos:
    - { src: /uploads/gallery/sample-1.jpg, caption: "장비 실습" }
    - { src: /uploads/gallery/sample-2.jpg, caption: "현장 측정" }
    - { src: /uploads/gallery/sample-3.jpg, caption: "데이터 분석 실습" }
- slug: symposium-2026
  title: 주요 행사
  date: 2026-04
  photos:
    - { src: /uploads/gallery/sample-4.jpg, caption: "학술 심포지엄" }
    - { src: /uploads/gallery/sample-5.jpg, caption: "포스터 세션" }
    - { src: /uploads/gallery/sample-6.jpg, caption: "단체 사진" }
```

> 참고: 위 `sample-*.jpg`는 자리표시 경로다. 실제 이미지를 `/admin`에서 업로드(또는 `static/uploads/gallery/`에 복사)하면 그대로 표시된다. 파일이 없으면 깨진 이미지로 보이므로, 데모 확인용으로 임시 이미지를 넣어도 된다.

- [ ] **Step 3: `content/gallery.md` 생성.**

```markdown
---
title: "갤러리·미디어"
kicker: "GALLERY"
layout: gallery
---

현장 실무교육·행사 사진과 영상을 모았습니다.
```

- [ ] **Step 4: `layouts/_default/gallery.html` 생성.** 앨범별 그리드(라이트박스 속성 포함) + 동영상 섹션 include(Task 11에서 videos.html 생성; 그 전엔 빈 partial 호출 회피를 위해 존재 가드).

```go-html-template
{{ define "main" }}
{{ partial "page-hero.html" . }}
<section class="section">
  <div class="container">
    {{ with .Content }}<div class="prose" style="margin-bottom:28px">{{ . }}</div>{{ end }}

    <div id="photos" class="page-section">
      {{ range site.Data.albums }}
      <div class="album">
        <h2 class="page-h2">{{ .title }} <span class="album-date">{{ .date }}</span></h2>
        <div class="gallery-grid">
          {{ range .photos }}
          <figure class="gallery-figure">
            <a class="js-lightbox" href="{{ .src }}" data-caption="{{ .caption }}">
              <img src="{{ .src }}" alt="{{ .caption }}" loading="lazy">
            </a>
            {{ with .caption }}<figcaption>{{ . }}</figcaption>{{ end }}
          </figure>
          {{ end }}
        </div>
      </div>
      {{ end }}
    </div>
  </div>
</section>

{{ partial "sections/videos.html" (dict "heading" "동영상") }}
{{ end }}
```

> 주의: 이 태스크 후 Task 11 전까지 `sections/videos.html`이 없으면 빌드가 실패한다. **Task 11을 이어서 수행**하거나, 임시로 빈 파일 `layouts/partials/sections/videos.html`(내용 `{{/* placeholder */}}`)을 먼저 만들어 빌드를 통과시킨 뒤 Task 11에서 채운다. 아래 Step 5에서 빈 파일을 먼저 만든다.

- [ ] **Step 5: 빈 videos partial 임시 생성**(빌드 통과용, Task 11에서 교체).

```bash
printf '{{/* placeholder — Task 11에서 구현 */}}\n' > layouts/partials/sections/videos.html
```

- [ ] **Step 6: `assets/css/main.css` 끝에 추가.**

```css

/* ── 갤러리 ── */
.album { margin-bottom: 40px; }
.album-date { font-size: .85rem; font-weight: 600; color: var(--text-muted); margin-left: 8px; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.gallery-figure { margin: 0; }
.gallery-figure a { display: block; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 10px; background: var(--bg-alt); }
.gallery-figure img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .25s ease; }
.gallery-figure a:hover img { transform: scale(1.05); }
.gallery-figure figcaption { font-size: .82rem; color: var(--text-muted); margin-top: 6px; }
```

- [ ] **Step 7 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
ls public/gallery/index.html
grep -c 'class="gallery-figure"' public/gallery/index.html   # → 6
grep -c 'js-lightbox' public/gallery/index.html              # → 6
```
Expected: `/gallery/` 렌더, figure 6개 + lightbox 앵커 6개, 빌드 ERROR 없음.

- [ ] **Step 8: 커밋.**

```bash
git add -A
git commit -m "feat: 갤러리 페이지 + 앨범 데이터 + 사진 그리드(라이트박스 속성)"
```

---

### Task 10: 라이트박스(main.js IIFE) + 스타일

스펙의 별도 `lightbox.js` 대신 **기존 `main.js`의 guarded-IIFE 패턴에 추가**(코드베이스 관례 일치, 추가 요청 없음).

**Files:**
- Modify: `assets/js/main.js` (마지막 IIFE 뒤, `})();` 닫기 전), `assets/css/main.css`

- [ ] **Step 1 (red):** 라이트박스 코드 없음.

```bash
grep -c "js-lightbox" assets/js/main.js; echo "exit=$?"
```
Expected: 0건.

- [ ] **Step 2: `assets/js/main.js` 수정** — "등장 애니메이션" 블록 다음, 파일 마지막 `})();` **앞**에 IIFE 추가.

```javascript

  // 사진 라이트박스 (.js-lightbox 앵커)
  (function () {
    var links = [].slice.call(document.querySelectorAll('a.js-lightbox'));
    if (!links.length) return;
    var box = null, imgEl, capEl, curList = links, curIdx = 0;

    function build() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.innerHTML =
        '<button class="lb-close" aria-label="닫기">✕</button>' +
        '<button class="lb-nav lb-prev" aria-label="이전">‹</button>' +
        '<figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>' +
        '<button class="lb-nav lb-next" aria-label="다음">›</button>';
      document.body.appendChild(box);
      imgEl = box.querySelector('img');
      capEl = box.querySelector('figcaption');
      box.querySelector('.lb-close').addEventListener('click', close);
      box.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
      box.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); go(1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
    }
    function open(i) {
      if (!box) build();
      curIdx = i;
      var a = curList[curIdx];
      imgEl.src = a.getAttribute('href');
      capEl.textContent = a.getAttribute('data-caption') || '';
      box.classList.add('is-open');
      document.body.classList.add('lb-lock');
      box.querySelector('.lb-close').focus();
    }
    function close() { if (box) { box.classList.remove('is-open'); document.body.classList.remove('lb-lock'); } }
    function go(d) { open((curIdx + d + curList.length) % curList.length); }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); curList = links; open(i); });
    });
    document.addEventListener('keydown', function (e) {
      if (!box || !box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  })();
```

- [ ] **Step 3: `assets/css/main.css` 끝에 추가.**

```css

/* ── 라이트박스 ── */
body.lb-lock { overflow: hidden; }
.lightbox { position: fixed; inset: 0; z-index: 1200; display: none; align-items: center; justify-content: center; background: rgba(7, 12, 24, .92); padding: 40px; }
.lightbox.is-open { display: flex; }
.lb-figure { margin: 0; max-width: 92vw; max-height: 86vh; text-align: center; }
.lb-figure img { max-width: 100%; max-height: 78vh; border-radius: 8px; }
.lb-figure figcaption { color: #cbd5e6; margin-top: 12px; font-size: .9rem; }
.lb-close, .lb-nav { position: absolute; background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.25); border-radius: 50%; cursor: pointer; display: grid; place-items: center; }
.lb-close { top: 18px; right: 18px; width: 44px; height: 44px; font-size: 1.1rem; }
.lb-nav { top: 50%; transform: translateY(-50%); width: 50px; height: 50px; font-size: 1.6rem; }
.lb-prev { left: 14px; } .lb-next { right: 14px; }
.lb-close:hover, .lb-nav:hover { background: rgba(255,255,255,.22); }
@media (max-width: 560px){ .lb-nav { width: 40px; height: 40px; } .lightbox { padding: 16px; } }
```

- [ ] **Step 4 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -c "js-lightbox" assets/js/main.js                        # → 1 (소스)
grep -rl "lightbox" public/assets 2>/dev/null || grep -rl "lightbox" public/ | head -1
```
Expected: main.js에 라이트박스 IIFE 존재, 빌드 ERROR 없음(번들 JS는 fingerprint된 파일명).

- [ ] **Step 5: 커밋.**

```bash
git add assets/js/main.js assets/css/main.css
git commit -m "feat: 사진 라이트박스(main.js IIFE + 스타일, 키보드·접근성)"
```

---

### Task 11: 동영상(혼합: 임베드 facade + self mp4)

**Files:**
- Modify: `layouts/partials/sections/videos.html` (Task 9의 임시 placeholder 교체)
- Create: `data/videos.yaml`
- Modify: `layouts/index.html`, `assets/js/main.js`, `assets/css/main.css`

- [ ] **Step 1 (red):** videos partial이 placeholder임.

```bash
grep -c "video-facade" layouts/partials/sections/videos.html; echo "exit=$?"
```
Expected: 0건.

- [ ] **Step 2: `data/videos.yaml` 생성** (예시 · 교체 가능).

```yaml
# 동영상(혼합) — kind: embed(YouTube/Vimeo) | self(mp4)
- title: 연구실 소개 영상
  kind: embed
  provider: youtube
  id: ScMzIvxBSi4         # 예시 ID — 실제 영상 ID로 교체
  poster: /uploads/videos/intro.jpg
  desc: 연구실 전반 소개.
- title: 세미나 하이라이트
  kind: embed
  provider: youtube
  id: aqz-KE-bpKQ         # 예시 ID — 실제 영상 ID로 교체
  poster: /uploads/videos/seminar.jpg
  desc: 최근 세미나 요약.
- title: 현장 실습 짧은 클립
  kind: self
  file: /uploads/clips/field-loop.mp4
  poster: /uploads/videos/field.jpg
  desc: 현장 실습 루프 영상.
```

- [ ] **Step 3: `layouts/partials/sections/videos.html` 전체 교체.** embed는 썸네일 facade(클릭 시 iframe), self는 `<video preload=none>`.

```go-html-template
{{- $heading := .heading | default "동영상" -}}
{{- $items := site.Data.videos -}}
{{- if $items -}}
<section class="section" id="videos">
  <div class="container">
    <header class="section-head reveal">
      <span class="section-num">·</span>
      <h2 class="section-title">{{ $heading }}</h2>
      <span class="section-kicker">Media</span>
    </header>
    <div class="video-grid reveal">
      {{ range $items }}
      <figure class="video-item">
        {{ if eq .kind "embed" }}
        {{ $embed := "" }}
        {{ if eq .provider "vimeo" }}{{ $embed = printf "https://player.vimeo.com/video/%s?autoplay=1" .id }}{{ else }}{{ $embed = printf "https://www.youtube-nocookie.com/embed/%s?autoplay=1&rel=0" .id }}{{ end }}
        <button class="video-facade" type="button" data-embed="{{ $embed }}" aria-label="{{ .title }} 재생"
                {{ with .poster }}style="background-image:url('{{ . }}')"{{ end }}>
          <span class="video-play" aria-hidden="true">▶</span>
        </button>
        {{ else }}
        <video controls preload="none" {{ with .poster }}poster="{{ . }}"{{ end }} class="video-self">
          <source src="{{ .file }}" type="video/mp4">
        </video>
        {{ end }}
        <figcaption class="video-cap">
          <strong>{{ .title }}</strong>
          {{ with .desc }}<span>{{ . }}</span>{{ end }}
        </figcaption>
      </figure>
      {{ end }}
    </div>
  </div>
</section>
{{- end -}}
```

- [ ] **Step 4: `layouts/index.html`에 삽입** (갤러리 미리보기는 Task 12; 여기서는 동영상까지). 최종 홈 조립:

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
  {{ partial "sections/trends.html" (dict "heading" "국제 동향 · LunaNet" "limit" 3 "background" true) }}
  {{ partial "sections/gallery-preview.html" . }}
  {{ partial "sections/videos.html" (dict "heading" "동영상") }}
  {{ partial "sections/news-latest.html" . }}
{{ end }}
```

> 주의: `gallery-preview.html`은 Task 12에서 생성. 이 태스크에서 위 index.html을 넣으면 Task 12 전까지 빌드 실패. **순서대로 Task 12를 이어서 수행**하거나, index.html에서 gallery-preview 줄을 잠시 빼고 Task 12에서 추가한다. 안전하게: 이 Step에서는 gallery-preview 줄을 **포함하지 말고** videos까지만 넣은 뒤, Task 12 Step에서 그 줄을 추가한다.

이 태스크의 index.html(잠정):
```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
  {{ partial "sections/trends.html" (dict "heading" "국제 동향 · LunaNet" "limit" 3 "background" true) }}
  {{ partial "sections/videos.html" (dict "heading" "동영상") }}
  {{ partial "sections/news-latest.html" . }}
{{ end }}
```

- [ ] **Step 5: `assets/js/main.js` 수정** — 라이트박스 IIFE 다음(파일 마지막 `})();` 앞)에 facade IIFE 추가.

```javascript

  // 동영상 임베드 facade (클릭 시 iframe 로드 — 성능)
  (function () {
    document.querySelectorAll('.video-facade').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-embed');
        if (!url) return;
        var f = document.createElement('iframe');
        f.src = url;
        f.title = btn.getAttribute('aria-label') || '동영상';
        f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        f.setAttribute('allowfullscreen', '');
        f.className = 'video-frame';
        btn.replaceWith(f);
      });
    });
  })();
```

- [ ] **Step 6: `assets/css/main.css` 끝에 추가.**

```css

/* ── 동영상 ── */
.video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.video-item { margin: 0; }
.video-facade, .video-self, .video-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; display: block; border: 0; }
.video-facade { position: relative; cursor: pointer; background: #0b1226 center/cover no-repeat; }
.video-facade .video-play { position: absolute; inset: 0; margin: auto; width: 58px; height: 58px; display: grid; place-items: center; background: rgba(30,58,138,.85); color: #fff; border-radius: 50%; font-size: 1.2rem; }
.video-facade:hover .video-play { background: var(--primary); }
.video-self { background: #000; }
.video-cap { margin-top: 10px; display: flex; flex-direction: column; gap: 2px; }
.video-cap strong { color: var(--ink); font-size: .98rem; }
.video-cap span { color: var(--text-muted); font-size: .86rem; }
```

- [ ] **Step 7 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -c 'class="video-facade"' public/index.html       # → 2 (embed 2개)
grep -c 'video-self' public/gallery/index.html         # → 1 (self 1개, 갤러리 페이지)
grep -o 'youtube-nocookie' public/index.html | head -1
```
Expected: 홈 facade 2개, 갤러리 self 비디오, 빌드 ERROR 없음.

- [ ] **Step 8: 커밋.**

```bash
git add -A
git commit -m "feat: 동영상 혼합(임베드 facade + self mp4) — 홈·갤러리"
```

---

### Task 12: 홈 "갤러리 미리보기"

**Files:**
- Create: `layouts/partials/sections/gallery-preview.html`
- Modify: `layouts/index.html`, `assets/css/main.css`

- [ ] **Step 1 (red):** 홈에 갤러리 미리보기 마커 없음.

```bash
hugo --gc --minify; grep -rl "gallery-preview" public/index.html; echo "exit=$?"
```
Expected: 없음(`exit=1`).

- [ ] **Step 2: `layouts/partials/sections/gallery-preview.html` 생성.** 모든 앨범 사진을 합쳐 앞 6장, 라이트박스 속성 포함.

```go-html-template
{{ $photos := slice }}
{{ range site.Data.albums }}{{ range .photos }}{{ $photos = $photos | append . }}{{ end }}{{ end }}
{{ if $photos }}
<section class="section" id="gallery-preview">
  <div class="container">
    <header class="section-head reveal">
      <span class="section-num">·</span>
      <h2 class="section-title">갤러리</h2>
      <span class="section-kicker">Gallery</span>
    </header>
    <div class="gallery-grid reveal">
      {{ range first 6 $photos }}
      <figure class="gallery-figure">
        <a class="js-lightbox" href="{{ .src }}" data-caption="{{ .caption }}">
          <img src="{{ .src }}" alt="{{ .caption }}" loading="lazy">
        </a>
      </figure>
      {{ end }}
    </div>
    <p class="section-foot"><a href="/gallery/">갤러리 더보기 →</a></p>
  </div>
</section>
{{ end }}
```

- [ ] **Step 3: `layouts/index.html`에 gallery-preview 추가** (trends 다음, videos 앞). 최종 홈 조립:

```go-html-template
{{ define "main" }}
  {{ partial "sections/hero.html" . }}
  {{ partial "sections/research-highlights.html" . }}
  {{ partial "sections/stats-strip.html" . }}
  {{ partial "sections/trends.html" (dict "heading" "국제 동향 · LunaNet" "limit" 3 "background" true) }}
  {{ partial "sections/gallery-preview.html" . }}
  {{ partial "sections/videos.html" (dict "heading" "동영상") }}
  {{ partial "sections/news-latest.html" . }}
{{ end }}
```

- [ ] **Step 4: `assets/css/main.css` 끝에 추가** (없으면; section-foot 좌측 정렬 변형 불필요, 기존 재사용). 추가 스타일 없음 — `.gallery-grid`(Task 9)·`.section-foot`(Task 5) 재사용.

- [ ] **Step 5 (green): 빌드 + 검증.**

```bash
hugo --gc --minify
grep -o 'id="gallery-preview"' public/index.html | head -1
grep -c 'js-lightbox' public/index.html        # → 6
```
Expected: 홈 갤러리 미리보기 6장 + 더보기, 라이트박스가 홈에서도 동작(앵커 6개), 빌드 ERROR 없음.

- [ ] **Step 6: 커밋.**

```bash
git add -A
git commit -m "feat: 홈 갤러리 미리보기(앞 6장 + 더보기)"
```

---

## Phase E — CMS · 문서 · 최종 점검

### Task 13: Sveltia CMS 컬렉션 확장

세미나 보드 + 데이터 파일(연구/실적/동향/동영상/앨범)을 CMS에서 편집 가능하게 한다.

**Files:**
- Modify: `static/admin/config.yml`

- [ ] **Step 1 (red):** seminar 컬렉션 없음.

```bash
grep -c "name: seminar" static/admin/config.yml; echo "exit=$?"
```
Expected: 0건.

- [ ] **Step 2: `static/admin/config.yml` 수정.** (a) `activity` 컬렉션 블록을 `seminar`로 교체(폴더 content/seminar, category 필드 추가). (b) 파일 끝에 데이터 파일 컬렉션 추가.

치환 — 기존 `- name: activity` … `widget: markdown }` 블록 전체를:
```yaml
  - name: seminar
    label: 세미나·교육
    label_singular: 세미나
    folder: content/seminar
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { name: title, label: 제목, widget: string }
      - { name: date, label: 작성일, widget: datetime, format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false }
      - { name: category, label: 분류, widget: select, options: ["세미나", "현장교육", "워크숍"], default: "세미나" }
      - { name: location, label: 장소, widget: string, required: false }
      - { name: draft, label: 임시저장(숨김), widget: boolean, default: false, required: false }
      - { name: body, label: 본문, widget: markdown }
```

파일 끝에 추가:
```yaml

  # ── 데이터 파일 컬렉션(목록형) ──
  - name: data
    label: 데이터(목록)
    files:
      - name: research
        label: 연구 분야
        file: data/research.yaml
        fields:
          - name: items
            label: 분야
            widget: list
            fields:
              - { name: title, label: 제목, widget: string }
              - { name: summary, label: 설명, widget: text }
              - { name: url, label: 링크, widget: string, default: "/research/#fields" }
              - { name: theme, label: 색(a~d), widget: select, options: ["a","b","c","d"], default: "a" }
              - { name: tag, label: 태그, widget: string, required: false }
      - name: achievements
        label: 연구 실적
        file: data/achievements.yaml
        fields:
          - name: items
            label: 실적
            widget: list
            fields:
              - { name: year, label: 연도, widget: number, value_type: int }
              - { name: type, label: 유형, widget: select, options: ["논문","프로젝트","발표","특허"] }
              - { name: title, label: 제목, widget: string }
              - { name: venue, label: 게재/발표처, widget: string, required: false }
              - { name: url, label: 링크, widget: string, required: false }
      - name: trends
        label: 국제 동향
        file: data/trends.yaml
        fields:
          - name: items
            label: 동향
            widget: list
            fields:
              - { name: title, label: 제목, widget: string }
              - { name: summary, label: 요약, widget: text }
              - { name: source, label: 출처, widget: string, required: false }
              - { name: url, label: 링크, widget: string, required: false }
              - { name: tag, label: 태그, widget: string, required: false }
      - name: videos
        label: 동영상
        file: data/videos.yaml
        fields:
          - name: items
            label: 영상
            widget: list
            fields:
              - { name: title, label: 제목, widget: string }
              - { name: kind, label: 종류, widget: select, options: ["embed","self"], default: "embed" }
              - { name: provider, label: 임베드 제공자, widget: select, options: ["youtube","vimeo"], default: "youtube", required: false }
              - { name: id, label: 영상 ID(임베드), widget: string, required: false }
              - { name: file, label: 파일(self), widget: file, required: false }
              - { name: poster, label: 썸네일, widget: image, required: false }
              - { name: desc, label: 설명, widget: string, required: false }
      - name: albums
        label: 사진 앨범
        file: data/albums.yaml
        fields:
          - name: items
            label: 앨범
            widget: list
            fields:
              - { name: slug, label: 슬러그, widget: string }
              - { name: title, label: 앨범명, widget: string }
              - { name: date, label: 날짜, widget: string }
              - name: photos
                label: 사진
                widget: list
                fields:
                  - { name: src, label: 이미지, widget: image }
                  - { name: caption, label: 캡션, widget: string, required: false }
```

> 참고: `data/*.yaml`은 현재 **최상위 리스트** 형식이다. Sveltia/Decap의 `file` 컬렉션은 보통 매핑 루트를 기대하므로, CMS 편집 호환을 위해 데이터 파일을 `items:` 키로 감싸는 방식이 안전하다. **다만 템플릿은 최상위 리스트를 읽고 있으므로**, CMS를 통한 편집을 실제로 쓰려면 (1) 데이터 파일을 `items:`로 감싸고 (2) 템플릿의 `site.Data.X`를 `site.Data.X.items`로 바꾸는 후속 정리가 필요하다. 본 태스크는 **CMS 설정만 추가**하고, 최상위 리스트 유지가 우선이면 이 `data` 컬렉션은 생략 가능(주석 처리). 세미나 컬렉션 교체는 필수.

- [ ] **Step 3 (green): YAML 파싱 + 빌드 확인.**

```bash
node -e "const y=require('fs').readFileSync('static/admin/config.yml','utf8'); console.log(y.includes('name: seminar')?'OK seminar':'MISSING')"
hugo --gc --minify; echo "build exit=$?"
```
Expected: "OK seminar", 빌드 성공(admin/config.yml은 static 패스스루).

- [ ] **Step 4: 커밋.**

```bash
git add static/admin/config.yml
git commit -m "feat: CMS 세미나 컬렉션 교체 + 데이터 파일 컬렉션 추가"
```

---

### Task 14: README·설정 정리 + 최종 전체 검증

**Files:**
- Modify: `README.md`, `hugo.toml`(주석)

- [ ] **Step 1: `README.md` 갱신.** "폴더 구조"·"자주 수정하는 곳" 표를 5탭/신규 데이터에 맞게 수정.

"자주 수정하는 곳" 표를 아래로 교체:
```markdown
| 바꾸고 싶은 것 | 위치 |
| --- | --- |
| 사이트 제목·설명·이메일·영문명 | `hugo.toml` `[params]` |
| 검색엔진 노출 차단 해제 | `hugo.toml` `noindex = false` (+ `static/_headers` 정리) |
| 상단 메뉴(GNB) | `data/gnb.yaml` |
| 히어로 슬라이드 | `data/hero.yaml` |
| 연구 분야 카드(홈·연구) | `data/research.yaml` |
| 연구 실적 | `data/achievements.yaml` |
| 국제 동향(LunaNet 등) | `data/trends.yaml` |
| 사진 앨범 | `data/albums.yaml` (이미지: `static/uploads/gallery/`) |
| 동영상 | `data/videos.yaml` |
| 공지·세미나·뉴스·행사 글 | `/admin` (CMS) 또는 `content/<분류>/*.md` |
| 색상·디자인 | `assets/css/main.css` (상단 `:root`) |
| 모션그래픽(연구·국제동향) | `layouts/partials/motion-slot.html` (현재 플레이스홀더, 2.5D 후속) |
```

"글이 저장되는 위치" 줄을 갱신:
```markdown
글이 저장되는 위치: `content/notice` · `content/seminar` · `content/news` · `content/event`
```

- [ ] **Step 2: `hugo.toml` 주석 갱신** (data 파일 목록 주석을 현행화).

치환 — `# 상단 메뉴(GNB)·히어로 ...` 주석 블록을:
```toml
# 데이터는 data/ 폴더에서 관리합니다.
#   - data/gnb.yaml          : 상단 메뉴(5탭)
#   - data/hero.yaml         : 메인 슬라이더
#   - data/research.yaml     : 연구 분야 카드
#   - data/achievements.yaml : 연구 실적
#   - data/trends.yaml       : 국제 동향(LunaNet)
#   - data/albums.yaml       : 사진 앨범
#   - data/videos.yaml       : 동영상
```

- [ ] **Step 3 (green): 최종 전체 빌드 + 핵심 경로 점검.**

```bash
hugo --gc --minify
for p in index about research notice seminar news event gallery resources activities; do
  test -f "public/$p/index.html" 2>/dev/null || test -f "public/index.html" && echo "$p ok"; done
grep -o 'class="gnb-item"' public/index.html | wc -l     # → 5
echo "build done"
```
Expected: 모든 핵심 페이지 생성, GNB 5탭, ERROR 없음.

- [ ] **Step 4: 로컬 육안 확인(권장).** `hugo server` → http://localhost:1313 에서 홈 스크롤(연구 하이라이트→지표→동향→갤러리→동영상→소식), `/research/`, `/gallery/`(라이트박스 클릭), `/seminar/` 확인. 모바일 폭에서 카드·그리드·라이트박스 반응형 점검.

- [ ] **Step 5: 커밋.**

```bash
git add README.md hugo.toml
git commit -m "docs: README·설정 주석 5탭/신규 데이터 반영"
```

---

## Self-Review 체크 (작성자 수행 완료)

- **스펙 커버리지:** 5탭(T1) · 연구소개(T3,T6) · 연구실적(T4,T6) · 국제동향/LunaNet(T5,T6) · 세미나(T7) · 홈 소식(T8) · 갤러리+라이트박스(T9,T10) · 동영상 혼합(T11) · 갤러리 미리보기(T12) · 모션 슬롯(T2, 각 섹션) · CMS(T13) · 문서(T14) → 스펙 항목 모두 태스크 존재. 2.5D 모션은 스펙상 범위 밖(후속).
- **플레이스홀더:** 예시 콘텐츠는 의도된 "교체 가능 예시"(스펙 원칙). 코드 스텝엔 전부 실제 코드 포함. `sample-*.jpg`·예시 영상 ID는 사용자가 교체할 자리표시로 명시.
- **타입/이름 일관성:** 데이터 키(`title/summary/url/theme/tag`, `year/type/title/venue/url`, `kind/provider/id/file/poster/desc`, `slug/title/date/photos[src,caption]`)가 템플릿·CMS·검증 grep에서 일치. `.js-lightbox`/`.video-facade`/`data-embed`/`.motion-slot[data-variant]` 클래스·속성명 태스크 간 일치.
- **순서 의존성 주의:** Task 9가 `sections/videos.html` placeholder를 먼저 만들고 Task 11이 교체. index.html의 `gallery-preview` 줄은 Task 12에서 추가(그 전엔 미포함). 각 태스크 빌드가 깨지지 않도록 명시.

## Execution Handoff

계획 완료, 저장 위치: `docs/superpowers/plans/2026-06-19-homepage-research-media.md`.
