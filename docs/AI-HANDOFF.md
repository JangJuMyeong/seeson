# 다른 AI를 위한 인수인계

기준일: 2026-10-27, Asia/Seoul. 다음 날 시연: 2026-10-28. 개발 컴피티션은 10/28–11/10, 발표는 11/11이다.

## 그대로 붙여 넣을 시작 프롬프트

```text
이 저장소는 CG Invites의 시선(see;線) / 见线 / SEE;LINE 데모입니다.
먼저 AGENTS.md, docs/AI-HANDOFF.md, docs/DEVELOPMENT.md,
skills/siseon-v5/SKILL.md를 읽고 현재 코드와 git status를 확인하세요.
이전 대화 없이 이 저장소를 기준으로 작업하세요.

보존할 것: 빠른 3D 선과 은하, 공식 회사 로고, ko/zh/en,
동일 궤적의 W→M1→M3→W, 질문 원문과 의사 확인/수정/개입/응답 기록.
의사 확인 전 개인 판정 금지, 근거 없는 개입 금지,
수락과 이행 구분, 거절 보존, 관찰 없는 미래 띠 축소 금지.

npm run verify로 기준 상태를 먼저 확인하고, 다음 요청을 구현하세요:
[여기에 원하는 변경을 적으세요]

구현 후 적절한 테스트와 브라우저 확인 결과, 남은 한계,
금지 패턴 점검 및 지침/3+1 대응을 보고하세요.
내일 시연 태그 demo-2026-10-28을 변경하지 마세요.
명시적 요청 없이 현재 배포 사이트나 공개 범위를 바꾸지 마세요.
```

영어 AI 환경에서도 같은 파일을 읽을 수 있다. 짧은 대체 프롬프트:

```text
Read AGENTS.md, docs/AI-HANDOFF.md and docs/DEVELOPMENT.md first.
Continue from this repository, without assuming access to any prior chat.
Run npm run verify, then implement: [requested change].
Preserve the 3D introduction, CG Invites logo, ko/zh/en and the shared
W→M1→M3→W trajectory. Follow the clinical meaning and state invariants
in AGENTS.md. Keep demo-2026-10-28 immutable. Report checks and limits.
```

## 지금 실제로 동작하는 것

- 정적 HTML/CSS/ES modules. 프레임워크와 빌드 과정 없음.
- Three.js 은하와, WebGL 불가 시 원근 3D Canvas 대체 렌더러.
- 하나의 가상 환자, `trajectory_id=siseon-trajectory-demo-001`.
- 데이터 모델은 `dist/care-model.js`, UI는 `dist/care-view.js`.
- 세 언어 174개 키. 언어는 URL `?lang=ko|zh|en`, 질문은 입력 원문으로 유지.
- 질문→확인/보류→퇴원 인계→측정 공백→승인→응답→후속 관찰. 정정 시 과거 승인·응답을 현재 계획에 재사용하지 않는다.
- 로컬 저장 `siseon-care-demo-v3`, 언어 저장 `siseon-language`. 새로고침 시 인트로의 이어보기로 복귀.
- 모든 데이터·의사·날짜 시나리오는 가상. 환자 서연, 의사 김서윤도 가상 인물.

## 구현하지 않은 것

서버·사용자 인증·실제 역할 권한·변조 방지 감사 로그·실제 유전체/EMR/웨어러블 연결·임상 예측·실제 JITAI 발송·병원 전체 선 묶음·Flutter 앱·동의 수집·의료기기 인허가·임상/재무 성과 검증. 현재의 클라이언트 게이트와 가상 합성 기록을 이 기능들의 완료로 보고하지 않는다.

## 유지해야 할 판단

- ‘건강 앱처럼 보이지 않아도 좋다’는 시각 방향을 유지한다. 숫자 카드나 챗봇으로 바꾸지 않는다.
- 중국어 `见线`은 음역이 아닌 의미 번역이다. 회사 로고는 원래 CG Invites 표기 유지.
- 확인 도장만으로 미래 띠를 좁히지 않는다. 별도의 가상 관찰이 연결될 때 관찰 공백을 줄인다.
- No 응답은 시간 재검토 제안을 만들되 자동으로 정책을 변경하지 않는다.
- M2 입원 화면은 시연에서 생략하고 가상 퇴원 인계 노드로 연속성을 표현한다.
- 과거 5년·오늘·미래 1년은 개념적 시간 구조다. 현재 그림의 좌표는 임상 수치나 실제 시간 간격에 비례하지 않는다.

## 기준 검증과 알려진 한계

이전 브라우저 검증에서 한국어 질문→중국어 의사 확인→영어 환자 응답→W 복귀를 완주했다. 진단 보류·정정 후 재승인·거절 보존·새로고침 이어보기·390px 프레임을 확인했다. 실제 iOS/Android 실기기와 중국 네트워크는 확인하지 않았다. WebGL 컨텍스트 실패 시 소프트웨어 렌더러를 사용했다. 실측 FPS나 의료 성과 수치는 없다.

새 AI가 실행한 검증은 별도로 보고한다. 인수인계 문서의 과거 결과를 자신이 방금 수행한 검증으로 말하지 않는다.
