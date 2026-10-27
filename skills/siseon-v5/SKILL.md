---
name: siseon-v5
description: Design and build 시선(see;線), the InvitesLoop V5 life-trajectory service, including its immersive 3D introduction, continuous W–M1–M3 experience, clinician confirmation, personal ontology and competition evidence. Apply to explicit 시선 or InvitesLoop V5 work, not unrelated healthcare or graphics projects.
---

# 시선 · see;線

‘삶의 선을 잇고, 더 나은 내일을 보는’ 서비스를 구현한다. 사용자의 V5 브리프와 회장 메시지가 출발점이며 최신 사용자 지시가 이 문서보다 우선한다.

## 필요한 기준만 읽기

- 브랜드·3D·UX: [experience.md](references/experience.md).
- 데이터·발화·의료진 확인·개입: [trajectory.md](references/trajectory.md).
- 지침·KPI·현장·경쟁: [evaluation.md](references/evaluation.md).

## 공통 기준

1. 사람 단위 궤적이 1급 객체다. W→M1→M2→M3→W에서 측정·질문·확인·이탈·개입 노드가 이어진다. 같은 저장소를 환자 앱·의사 화면·디지털 워드가 다른 뷰로 본다.
2. 최신 시각 방향은 수만 가닥의 빠른 3D 선, 선택 시 공간으로 진입하는 카메라, 은하 같은 연결, 선택에 따라 갈라지는 미래 경로다. 정적 2D 선으로 대체하지 않는다. 개인 경험은 선택한 나의 선에 집중한다.
3. 첫 개인 화면의 숫자 카드·점수·순위는 0개. IRS+ 기저 레이어, 건강기준선·질환민감선, 미래 범위, 다음 한 걸음이 궤적에 붙는다. 질문은 채팅창 대신 선 위 노드로 남긴다.
4. 의사 확인 전 AI 개인 판정 금지. 일반 지침 설명·기록 관찰·의사 확정 전달을 구별한다. 확인 후 질환명은 확인자·시점·원문과 연결한다. 확인 범위 밖으로 발화나 개입 권한을 확대하지 않는다.
5. 모든 개입에 근거·책임 의료진·승인 범위·사용자 수락/거절·로그를 붙인다. 필수 요소가 없으면 발송하지 않는다. 데모를 실제 진료·발송으로 표현하지 않는다.
6. IRS+는 W·M1·M2·M3 전체에 유지한다. 회색지대 기능은 역할·동의·기관 협의·법률 검토 상태에 맞춰 플래그로 제어한다. 플래그 자체는 승인이 아니다.
7. 미래 방향, 불확실성, 관찰 결과를 구분한다. 도장이나 클릭만으로 건강 향상·좁은 예측 범위를 만들지 않는다. 시연의 도형·가정은 표시한다.
8. 온톨로지 관계에 출처·유효 시점·주장 주체·가설/확정 상태·정정 이력을 둔다. 개인의 맥락을 근거 없이 사실로 굳히지 않는다.

새 기능마다 지침 번호·3+1 대응·관찰 가능한 검증법을 짧게 남긴다. 이 대응표를 환자 화면에 노출하지 않는다. 일반 건강 앱, EMR 요약, 센서 대시보드, 분리된 원격관리 앱/포털, LLM으로 감싼 기존 기능이라는 금지 패턴 여부를 직접 점검하고 결과를 말한다. 미구현·가상·측정 결과·목표를 구분한다.

환자 Flutter(iOS·Android), 의사·디지털 워드 웹이라는 플랫폼 선택을 보존한다. 브라우저 3D 콘셉트 데모를 Flutter·임상 통합 완료로 보고하지 않는다. 외부 계정 연결·공유·발송 권한을 자동 확대하지 않는다.
