# 개발과 운영 인수인계

## 구조

```text
dist/
  index.html, styles.css       브랜드·레이아웃·접근성
  app.js                      인트로·언어·저장·화면 전환
  i18n.js                     ko/zh/en 문구
  care-model.js               순수 상태 전이·승인 게이트
  care-view.js                같은 궤적의 W/M1/M3/W 관점
  trajectory-view.js          개인 선의 공간 투영
  scene.js                    Three.js WebGL 은하
  software-scene.js           GPU 불가 시 원근 렌더러
  assets/, vendor/            공식 로고·Three.js·라이선스
scripts/                      로컬 서버·검증·전달 패키지
 tests/                       상태 전이·언어·서버 검증
skills/siseon-v5/              재사용 가능한 제품 기준
.openai/hosting.json           기존 Sites 연결 식별자 (비밀값 아님)
```

## 로컬 실행

Node 22 이상 권장, 기준 확인 환경 Node 24.2.0. 런타임 npm 의존성이 없으므로 설치 없이 `npm run dev`를 실행한다. 기본 서버는 `127.0.0.1:4173`에만 바인딩한다.

```sh
npm run dev
npm run dev -- --port 4174
npm run verify
```

포트 충돌 시 다른 포트를 선택한다. 임의 프로세스를 종료하지 않는다. 서버 종료는 실행한 터미널에서 Ctrl+C. `file://`로 HTML을 직접 열면 ES module 로딩이 막힐 수 있으므로 HTTP 서버를 사용한다.

Python 3만 있을 때는 `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`로 실행 가능하다. Node 기반 자동 테스트에는 Node가 필요하다.

## 상태 전이 계약

`applyEvent(state, event)`는 기존 상태를 수정하지 않고 복사본을 반환하거나 오류를 던진다. UI는 이 함수를 거쳐야 한다.

| 이벤트 | 선행 조건 | 남는 기록 |
| --- | --- | --- |
| QUESTION | 환자 역할, 비어 있지 않은 질문 | 질문 원문·입력 언어·맥락/측정/IRS+ 연결 |
| VISIT M1 | 질문 | 같은 궤적의 진료 관점 |
| REVIEW | 의료진 역할, M1, confirm/defer·plan | 확인/보류·범위·supersedes·근거 |
| VISIT M3 | 확인/보류 기록 | 가상 M2 퇴원 인계 |
| ADVANCE | 의료진 역할, M3, 퇴원 기록 | 가상 3일 측정 공백 |
| APPROVE | 의료진·동의·현재 확인 범위·근거 확인 | 현재 판단을 참조하는 승인 제안 |
| RESPOND | 환자·현재 승인 | Yes/No; No이면 검토 대기 개선 후보 |
| OBSERVE | 환자·현재 승인에 대한 Yes | 별도의 가상 측정 재개 관찰 |
| VISIT W2 | 현재 승인에 대한 응답 | 확인·개입·응답을 지닌 같은 선 |

`currentReview`, `currentIntervention`, `currentResponse`, `currentOutcome`으로 현재 판단에 연결된 기록을 찾는다. `last`만으로 과거 승인/응답을 현재 것으로 취급하지 않는다. `diagnosis`는 최신 의사 결정이 confirm일 때만 질환을 전달한다. 데이터 구조 변경 시 `VERSION`과 저장 키, 복원 규칙을 함께 검토한다.

브라우저의 role·consent·audit는 조작 가능한 데모 상태다. 실제 서버에서는 인증·권한·동의·정책 유효성·중복 발송 방지·감사 로그를 별도로 구현해야 한다.

## 언어와 화면

세 언어 키는 항상 함께 수정한다. UI 생성 문자열 중 번역 사전은 개발자가 관리하는 내용이며, 사용자 질문은 `esc()`로 이스케이프한다. `innerHTML`에 외부 입력을 직접 연결하지 않는다. 중국어판에도 한국 지침의 출처와 국가를 보존하며, 중국 임상 기준으로 오인하게 바꾸지 않는다.

Three.js와 대체 렌더러는 공통 `setStage`, `setFocus`, `flyThrough`, `burst`, `setPaused`, `destroy` 동작을 가진다. 변경 시 둘 다 확인한다. 로고 자산을 AI로 재생성하지 않는다.

## 시연 태그와 개발 브랜치

```sh
git switch -c feature/my-change
npm run verify
```

`demo-2026-10-28`은 내일 시연용 고정 기록이다. 수정하거나 강제 이동하지 않는다. 시연본만 따로 확인하려면 별도 폴더에 `git clone --branch demo-2026-10-28 https://github.com/JangJuMyeong/seeson.git siseon-demo-20261028`을 사용한다. 기존 작업 폴더의 미커밋 변경을 버리면서 체크아웃하지 않는다.

## GitHub와 배포 사이트의 관계

- 이 저장소는 후속 개발과 AI 인수인계의 기준이다.
- 기존 Sites 사이트의 확인된 코드 기준은 커밋 `43b2d962e91366c4dfb29b4b0a993f5e49700b7f`다. 그 이후 이 저장소에는 실행 도구와 인수인계 문서를 추가했다. 현재 `dist/`는 시연 사이트와 동일하게 유지한다.
- GitHub Actions는 검사만 실행한다. GitHub push나 태그 생성만으로 Sites 사이트는 바뀌지 않는다.
- 실제 배포 시 Sites 플러그인의 공식 워크플로를 이용하고 `.openai/hosting.json`의 기존 project_id와 접근 범위를 보존한다. GitHub remote를 Sites source remote로 덮어쓰지 않는다. 별도 배포 체크아웃에 검증된 변경을 옮겨 Sites source helper로 동기화·패키징·배포한다.
- 다른 AI에 Sites 연결 권한이 없어도 `dist/` 전체를 일반 정적 호스팅으로 서비스할 수 있다. 공개·접근 범위 변경은 사용자의 의도를 확인한다.

## 전달 패키지

Python 3가 있다면 `npm run package:demo` 또는 `python3 scripts/package-demo.py`로 `artifacts/siseon-demo-2026-10-28.zip`을 만든다. 실행 파일·앱·문서·스킬·테스트를 포함하고 `.git`, 호스팅 식별자, 비밀값, 로컬 저장 데이터는 제외한다. 배포 대상이 아니라 오프라인 전달용 소스 패키지다.
