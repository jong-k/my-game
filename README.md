# Game Development with TypeScript
HTML, CSS, TypeScript 로 만든 2D 슈팅 게임
## 목차
### 1. 제작 배경
### 2. 프로젝트 소개
### 3. 후기

## 1. 제작 배경
- 평소에 게임을 만들어보고 싶었는데, 유데미의 좋은 JavaScript 게임 개발 강의를 알게됐고, JavaScript 대신 TypeScript를 적용해서 만들어보자고 계획
- TypeScript를 React에 적용하기 전에, Vanilla JS에도 적용해보고 싶었음

## 2. 프로젝트 소개
### 2-1. 사용된 기술과 종속성
**Core**

- HTML
- CSS
- TypeScript

**dependency**

- prettier

> Web API인 Canvas API를 중점적으로 사용하여 애니메이션 및 그래픽, 시각화 처리했습니다. 게임 로직 구현을 위해 각 세부 Class를 기반으로 객체지향 프로그래밍 방법론을 사용했습니다.

### 2-2. 폴더 구조
```
📦mygame
┣ 📂src
┃ ┣ 📜app.ts : 컴파일 될 TS 파일
┃ ┣ 📜index.html : root page
┃ ┗ 📜style.css : 스타일
┣ 📜.gitignore
┣ 📜.prettierrc
┣ 📜index.md
┣ 📜package.json
┣ 📜package-lock.json
┣ 📜README.md
┗ 📜tsconfig.json
```
### 2-3. 사용법
- TypeScript 설치 확인 후 dependency 설치
  ```
  npm i
  ```
- /dist/index.html 파일 열기

## 3. 후기
- 간단하지만, 어떤 웹애보다도 인터랙티브한 이 게임이 단지 500 여 줄의 코드와, 몇 장의 이미지 들로 구성된다는 것이 정말 신기하게 느껴진다.
