# 몇충 계산기

GitHub Pages의 `candy` 저장소에 올려 사용할 수 있는 순수 HTML/CSS/JavaScript 웹앱입니다. 패키지 설치나 별도 빌드 명령 없이 파일을 그대로 배포합니다.

## 포함 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 계산기 화면과 페이지 제목 |
| `style.css` | 기본 스타일, 모바일 배치, 증감 색상 |
| `script.js` | 충전 비용, 할인, 증감 버튼, 비교 계산 |
| `favicon.svg` | 브라우저 탭 아이콘 |
| `.nojekyll` | GitHub Pages가 정적 파일을 그대로 배포하도록 설정 |
| `README.md` | 사용 및 배포 안내 |

화면에 필요한 이미지 파일은 `favicon.svg` 하나입니다. 외부 폰트, 이미지 주소, 라이브러리, API 키가 필요하지 않습니다.

## GitHub Pages 배포

1. GitHub에서 `candy` 저장소를 만들거나 기존 저장소를 엽니다. GitHub Free를 사용한다면 공개 저장소를 사용합니다.
2. 압축을 푼 **파일들을 저장소 최상위**에 올리고 `main` 브랜치에 커밋합니다. 저장소 안에 `candy` 폴더를 한 번 더 만들지 마세요. 저장소 첫 화면에서 `index.html`, `style.css`, `script.js`, `favicon.svg`가 보여야 합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
5. **Branch**를 `main`, 폴더를 `/(root)`로 선택하고 **Save**를 누릅니다.
6. 배포가 완료되면 `https://내아이디.github.io/candy/`로 접속합니다. `내아이디`는 실제 GitHub 계정 이름으로 바꿉니다.

ZIP 파일 자체를 저장소에 올리는 대신 압축을 푼 파일을 올려 주세요. 로컬에서 먼저 확인하려면 같은 폴더에 파일들을 둔 상태로 `index.html`을 브라우저에서 열면 됩니다.

## 경로

`index.html`은 `./style.css`, `./script.js`, `./favicon.svg`만 불러옵니다. 모두 현재 HTML 위치를 기준으로 하는 상대경로이므로 `/candy/` 하위 경로에서 동작합니다. 계정 이름이나 배포 주소를 코드에 입력할 필요가 없습니다.

## 현재 기능

- 왕사탕 0~15회, 별사탕 0~5회: 숫자 직접 입력 또는 [+] [-] 버튼으로 변경합니다.
- 사탕별 할인 체크박스: 선택한 비용과 전체 합계가 즉시 계산됩니다.
- 비교 모드: 두 계산기가 독립적으로 동작하고, 좁은 화면에서는 위아래로 배치됩니다. 모드를 껐다 켜도 해당 페이지의 입력값과 할인 선택이 유지됩니다.
- 오른쪽 비교 금액: 오른쪽에서 왼쪽 금액을 뺀 차이를 `N 엘리프 (+N)` 또는 `N 엘리프 (-N)`으로 표시합니다. 증가 색상은 `#FF0000`, 감소 색상은 `#0000FF`이며, 차이가 0이면 표시를 생략합니다.
- 범위를 벗어난 입력에는 오류를 표시하고, 계산할 수 없는 증감 값은 숨깁니다.

충전 비용 표는 `script.js`의 `prices`에 있습니다. 스타일 변경은 `style.css`, 화면 문구 변경은 `index.html`에서 할 수 있습니다.

## 참고

- [GitHub Pages 게시 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages 사이트 만들기](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
