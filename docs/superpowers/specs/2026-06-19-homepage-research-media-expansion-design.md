# 미래우주 홈페이지 — 연구·미디어 콘텐츠 확장 설계

- 작성일: 2026-06-19
- 상태: 승인됨(브레인스토밍) → 구현 계획 대기
- 대상: Hugo 정적 사이트(`미래우주홈페이지`), Cloudflare Pages(Git 연동) 배포

## 1. 목표

홈페이지에 **연구 소개·연구 실적·국제 동향(LunaNet)·세미나/현장교육·사진 갤러리·동영상**을 담아, 단순 데모를 "우주 항법(GNSS·PNT) 연구실 형태"의 정보 사이트로 확장한다. 연구·국제동향 섹션에는 주제를 감각적으로 전달하는 모션그래픽 오브젝트 자리를 마련한다.

## 2. 제약·원칙

- **콘텐츠 수준**: 섹션·레이아웃은 완성하되 본문은 GNSS·PNT·LunaNet 등 실제 분야에 맞춘 **교체 가능한 예시**로 채운다. (기존 "일반화" 원칙과 호환 — 확정 내용 수령 시 교체)
- **간결성 유지**: 탭은 5개를 넘기지 않는다.
- **비공개 유지**: `noindex` 3중 처리 유지(meta robots / robots.txt / `_headers`).
- **배포 불변**: Cloudflare Pages Git 연동(`hugo --gc --minify`, output `public`, `HUGO_VERSION=0.163.2`). 별도 CI 없음.
- **작성 경로**: 신규 콘텐츠는 Sveltia CMS(`/admin`, 로컬 모드) 또는 데이터 파일로 관리.
- **무라이브러리**: 모션·라이트박스는 외부 JS 라이브러리 없이 CSS/SVG/소규모 canvas로 구현.
- **접근성·성능 우선**: `prefers-reduced-motion` 존중, 이미지·임베드 지연 로딩.
- 응답·문구는 한국어.

## 3. 정보 구조 (5탭)

| 탭 | 경로 | 구성 |
|---|---|---|
| 소개 | `/about/` | 소개·비전·연혁·구성원·연락 *(기존 유지)* |
| 연구 | `/research/` | ① 연구 소개(분야 카드) ② 연구 실적(목록) ③ 국제 동향(LunaNet 카드 + 모션 슬롯). **기존 `/activities/` 대체** |
| 소식 | `/notice/`·`/seminar/`·`/event/`·`/news/` | 공지사항 · **세미나·교육(신규 보드)** · 행사일정 · 뉴스 |
| 갤러리·미디어 | `/gallery/` | 사진 갤러리(그리드+라이트박스) · 동영상(혼합) |
| 자료실 | `/resources/` | 발표자료·문서·아카이브 *(기존 유지)* |

- **역할 분리 원칙**: 설명=연구 탭, 공지=소식 탭, 사진·영상=갤러리 탭, 내려받는 파일=자료실. 같은 행사라도 공지는 소식, 사진은 갤러리에 쌓고 상호 링크.
- `data/gnb.yaml`을 5탭 구조로 갱신. `활동·연구 → 연구`로 라벨/경로 변경, `갤러리·미디어` 신설.

## 4. 홈(랜딩) 구성

히어로 아래로 다음 요약 섹션을 위→아래 순으로 배치(승인됨):

1. **히어로 슬라이더** *(기존 유지)*
2. **연구 하이라이트** — 대표 연구 분야 카드(현 "둘러보기"를 연구 중심으로 재구성) · **모션 슬롯 포함**
3. **연구 실적 지표 스트립** — 논문/프로젝트/발표 수 집계 띠. `data/achievements.yaml`이 있을 때만 렌더(없으면 자동 숨김)
4. **국제 동향 · LunaNet** — 동향 카드 2~3개 + 더보기 · **모션 슬롯 포함**
5. **갤러리 미리보기** — 현장교육·행사 사진 그리드 + 갤러리 더보기
6. **동영상** — 대표 영상(임베드) + 썸네일
7. **최근 소식** — 공지·세미나·행사 최신 항목
8. **푸터** *(기존 유지)*

각 홈 섹션은 해당 탭으로 진입하는 링크를 가진다.

## 5. 콘텐츠 데이터 모델

작성은 CMS/Markdown, 구조화 목록은 `data/*.yaml`로 관리한다. 모든 값은 **예시이며 교체 가능**.

### 5.1 연구 분야 — `data/research.yaml`
홈 "연구 하이라이트" + `/research/` 공용.
```yaml
- title: 위성항법(GNSS) 신호처리
  summary: GNSS 신호 수신·처리와 측위 정확도 향상에 대한 연구.
  tag: GNSS
  icon: signal        # 선택(아이콘 키)
```

### 5.2 연구 실적 — `data/achievements.yaml`
`/research/` 목록 + 홈 지표 스트립 집계 소스.
```yaml
- year: 2026
  type: 논문           # 논문 | 프로젝트 | 발표 | 특허
  title: 도심 환경 GNSS 다중경로 완화 기법
  venue: 한국항법학회   # 학술지/학회/기관
  url:                 # 선택(링크)
```

### 5.3 국제 동향 — `data/trends.yaml`
```yaml
- title: LunaNet — 달 통신·항법 아키텍처
  summary: 달 표면·궤도에서의 PNT·통신 상호운용 프레임워크.
  source: NASA / ESA
  url: https://www.nasa.gov/lunanet
  tag: 달 PNT
```

### 5.4 세미나·교육 — `content/seminar/*.md`
보드(게시판). 기존 `list.html` 레이아웃 재사용, `/seminar/` 경로. front matter: `title, date, category(세미나|현장교육|워크숍)`.

### 5.5 갤러리 — `data/albums.yaml`
앨범 단위. 이미지는 CMS 업로드(`static/uploads/gallery/`).
```yaml
- slug: field-training-2026
  title: 현장 실무교육
  date: 2026-05
  cover: /uploads/gallery/ft-cover.jpg
  photos:
    - { src: /uploads/gallery/ft-01.jpg, caption: 장비 실습 }
    - { src: /uploads/gallery/ft-02.jpg, caption: 현장 측정 }
```

### 5.6 동영상 — `data/videos.yaml` (혼합)
```yaml
- title: 연구실 소개 영상
  kind: embed          # embed | self
  provider: youtube    # embed일 때: youtube | vimeo
  id: VIDEO_ID         # embed일 때 영상 ID
  file:                # self일 때 파일 경로(/uploads/clips/xx.mp4)
  poster: /uploads/videos/intro.jpg   # 썸네일(권장)
  desc: 연구실 전반 소개.
```

## 6. 미디어 처리

- **동영상(혼합)**:
  - 대표 영상은 **YouTube/Vimeo 임베드**. 초기엔 `poster` 썸네일만 렌더하고 클릭 시 iframe 로드(facade 패턴)로 성능 확보.
  - 짧은 루프 클립만 **self-host `mp4`**(`muted loop playsinline preload="none"`), `poster` 필수, 적정 용량 권장(주의 문구를 작성 가이드에 명시).
- **사진 갤러리**:
  - 반응형 그리드(가변 컬럼) + **경량 자체 라이트박스**(`assets/js/lightbox.js`, 라이브러리 없음).
  - 키보드(←/→/Esc)·`aria`·포커스 트랩, `loading="lazy"`, 캡션 표시.

## 7. 모션그래픽 슬롯 (현재 = 플레이스홀더, 2.5D = 후속)

- 연구·국제동향 섹션에 `layouts/partials/motion-slot.html`로 **모션 슬롯**을 예약한다.
- **현재 단계**: 은은한 **정적 플레이스홀더**(옅은 궤도/그리드 SVG)만 렌더하고 `<!-- TODO: 2.5D motion -->`로 표시. 레이아웃이 비어 보이지 않게 함.
- **후속 단계(별도)**: 사용자가 **연구 주제 리스트**를 수령한 뒤, 주제 맞춤 **2.5D**(깊이감·패럴랙스의 의사 3D) 모션그래픽을 HTML/CSS/JS로 구현. `prefers-reduced-motion` 존중, 무라이브러리, CSS transform/소규모 canvas 기반.
- 이 후속 작업은 본 스펙의 **범위 밖**이며, 슬롯 인터페이스(placeholder ↔ 실제 오브젝트 교체)만 본 스펙에서 보장한다.

## 8. 비기능 요구

- **접근성**: 모션 정지(`prefers-reduced-motion`), 라이트박스·캐러셀 키보드·`aria`, 색 대비 유지.
- **성능**: 모션은 경량(CSS transform/소규모 canvas), 이미지·임베드 지연 로딩, 갤러리 썸네일 분리 권장.
- **비공개**: `noindex` 유지.
- **배포**: Cloudflare Git 연동 그대로, 추가 빌드 설정 불필요.

## 9. 영향 파일 (개략)

**신규**
- `data/`: `research.yaml`, `achievements.yaml`, `trends.yaml`, `videos.yaml`, `albums.yaml`
- `layouts/partials/sections/`: `research-highlights.html`, `trends.html`, `gallery-preview.html`, `videos.html`, `news-latest.html`, `stats-strip.html`
- `layouts/partials/`: `motion-slot.html`
- `layouts/_default/`: `research.html`, `gallery.html`
- `content/`: `research.md`, `gallery.md`, `seminar/_index.md`
- `assets/js/`: `lightbox.js`
- `static/uploads/`: 이미지·클립 업로드 경로

**수정**
- `data/gnb.yaml` (5탭)
- `layouts/index.html` (홈 섹션 조립)
- `assets/css/main.css` (신규 섹션·라이트박스·모션 슬롯 스타일)
- `static/admin/config.yml` (seminar·gallery·videos·achievements·trends 컬렉션 추가)
- `hugo.toml` 필요 시 파라미터 추가
- `README.md` (구조·작성법 갱신)
- `content/activities.md` → `content/research.md`로 대체, 기존 `/activities/`는 Hugo `aliases`로 `/research/`에 연결

## 10. 범위 밖 / 후속

- **2.5D 모션그래픽 구체화** — 연구 주제 리스트 수령 후 별도 진행(§7).
- 공개 전환(`noindex` 해제), CMS 온라인 모드(다중 작성자) 전환.
- 실제 연구·실적·행사 데이터 확정 반영(현재는 예시).

## 11. 미해결 입력

- 연구 주제 리스트(2.5D 모션 및 연구 분야 카드 확정용) — 사용자 제공 대기.
```
