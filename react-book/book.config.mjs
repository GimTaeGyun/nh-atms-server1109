/**
 * 책 설정 — 제목, 차례(부·장), 장별 원고 파일과 목표 쪽수.
 * 합계 150쪽 = 앞(표지 1 · 속표지 1 · 판권 1 · 머리말 2 · 읽는 방법 1 · 차례 2) 8 + 부 표지 4 + 본문 136 + 찾아보기 2
 */
export default {
  title: '번호표 뽑고 시작하는 리액트',
  subtitle: '은행 업무 화면 소스로 배우는 첫 프론트엔드',
  author: 'ATMS 프론트엔드팀 엮음',
  runningTitle: '번호표 뽑고 시작하는 리액트',
  /** "우리 소스" 인용을 대조할 실제 소스 위치 (이 파일 기준 상대 경로) */
  sourceRoot: '../nh-atms-common-main/Frontend/nh-atms-web',
  output: 'react-book.pdf',
  totalPages: 150,
  coverHtml: 'parts/cover.html',
  halfTitleHtml: 'parts/halftitle.html',
  colophonHtml: 'parts/colophon.html',
  front: [
    { id: 'preface', title: '머리말', file: 'manuscript/00-preface.md', budget: 2 },
    { id: 'guide', title: '이 책을 읽는 방법', file: 'manuscript/00-guide.md', budget: 1 },
  ],
  parts: [
    {
      no: 1,
      title: '웹 화면의 기초 체력',
      intro: [
        '은행에 처음 온 사람은 창구로 곧장 가지 않습니다. 번호표를 뽑고, 어디에 무엇이 있는지 둘러보고, 전표 쓰는 법을 익힙니다. 1부가 그 시간입니다.',
        '브라우저가 화면을 어떻게 받아 그리는지 보고, 화면을 이루는 세 가지 말인 HTML·CSS·자바스크립트를 우리 소스를 읽는 데 필요한 만큼만 배웁니다. 마지막에는 자바스크립트에 이름표를 붙이는 타입스크립트까지 갑니다. 여기를 지나면 소스 파일을 열었을 때 낯선 기호가 훨씬 줄어듭니다.',
      ],
      chapters: [
        { no: 1, title: '웹 화면은 어떻게 뜰까', blurb: '브라우저와 서버가 주고받는 것, 그리고 우리 프로젝트를 내 PC에서 띄우기', files: ['manuscript/01-web.md'], budget: 7 },
        { no: 2, title: 'HTML과 CSS, 화면의 뼈대와 옷', blurb: '태그로 뼈대를 세우고 CSS로 모양을 입히는 법', files: ['manuscript/02-html-css.md'], budget: 7 },
        { no: 3, title: '자바스크립트, 꼭 필요한 문법만', blurb: '변수와 함수부터 배열 다루기, 모듈, 기다리는 코드까지', files: ['manuscript/03-javascript.md'], budget: 14 },
        { no: 4, title: '타입스크립트, 값에 이름표 붙이기', blurb: '타입 표기를 읽는 법과 공지사항의 자료 모양', files: ['manuscript/04-typescript.md'], budget: 8 },
      ],
    },
    {
      no: 2,
      title: '리액트 기본기',
      intro: [
        '이제 창구 앞에 섰습니다. 2부에서는 리액트가 화면을 만드는 방식을 배웁니다. 화면을 부품으로 나누고, 부품에 값을 건네고, 값이 바뀌면 화면이 따라 바뀌게 하는 것. 리액트는 이 세 가지가 거의 전부입니다.',
        '개념마다 우리 소스에서 가장 짧은 실제 코드를 골라 읽습니다. 일곱 줄짜리 부품에서 시작해 공지사항 화면이 팝업을 여닫는 방법까지 갑니다.',
      ],
      chapters: [
        { no: 5, title: '컴포넌트와 JSX', blurb: '화면을 부품으로 나누고, 자바스크립트 안에 화면을 적는 법', files: ['manuscript/05-component-jsx.md'], budget: 8 },
        { no: 6, title: 'props, 부품에 값 건네기', blurb: '부모가 자식에게 값과 화면 조각과 함수를 건네는 길', files: ['manuscript/06-props.md'], budget: 7 },
        { no: 7, title: 'state와 이벤트', blurb: '버튼을 누르면 화면이 바뀌는 원리', files: ['manuscript/07-state-event.md'], budget: 9 },
        { no: 8, title: '훅 더 알아보기', blurb: 'useEffect와 useMemo, 그리고 나만의 훅', files: ['manuscript/08-hooks.md'], budget: 9 },
      ],
    },
    {
      no: 3,
      title: '우리 프로젝트 읽기',
      intro: [
        '기본기를 익혔으니 건물 전체를 돌아볼 차례입니다. 3부에서는 프로젝트의 폴더와 파일이 어떻게 맞물려 화면 하나를 띄우는지 따라갑니다.',
        '주소를 치면 어떤 파일이 차례로 일하는지, 화면은 어디에 등록하는지, 로그인한 사람의 정보는 어디에 두는지, 서버와는 어떻게 이야기하는지, 그리고 화면을 조립할 때 쓰는 공통 부품에는 무엇이 있는지 봅니다. 3부를 마치면 공지사항 화면의 소스가 낯설지 않습니다.',
      ],
      chapters: [
        { no: 9, title: '프로젝트 지도', blurb: '폴더와 설정 파일, 주소창에서 첫 화면까지의 길', files: ['manuscript/09-project-map.md'], budget: 6 },
        { no: 10, title: '화면 이동과 메뉴', blurb: '주소와 화면을 잇는 라우터, 화면 등록부, 탭', files: ['manuscript/10-routing-menu.md'], budget: 6 },
        { no: 11, title: '전역 상태와 스토어', blurb: '여러 화면이 함께 쓰는 값과 권한', files: ['manuscript/11-store.md'], budget: 5 },
        { no: 12, title: '서버와 대화하기', blurb: 'API 함수, 읽기와 쓰기, 조회 화면의 공식', files: ['manuscript/12-api-query.md'], budget: 9 },
        { no: 13, title: '공통 부품으로 화면 조립하기', blurb: '화면 틀, 조회조건, 표, 팝업을 이루는 부품들', files: ['manuscript/13-common-parts.md'], budget: 9 },
      ],
    },
    {
      no: 4,
      title: '실전, 화면 하나 만들기',
      intro: [
        '딩동. 14번 창구에 불이 들어왔습니다. 지금까지 읽기만 했다면 이제는 손으로 만들 차례입니다.',
        '4부는 장이 하나뿐입니다. 공지사항 화면을 빈 파일에서 시작해 조회, 표, 팝업, 등록과 수정, 삭제, 엑셀과 출력까지 한 단계씩 따라 만듭니다. 단계마다 앞에서 배운 개념이 어디에 쓰이는지 짚어 드립니다. 끝까지 따라 하면 여러분의 손에는 실제 업무 화면 하나가 남습니다.',
      ],
      chapters: [
        {
          no: 14,
          title: '공지사항으로 공부하기',
          blurb: '빈 파일에서 시작해 조회·등록·수정·삭제·엑셀·출력까지 따라 만들기',
          files: ['manuscript/14-notice-1.md', 'manuscript/14-notice-2.md', 'manuscript/14-notice-3.md'],
          budget: 32,
        },
      ],
    },
  ],
};
