# 목차
### 1. HTML & CSS setup
- canvas element 내부에서 게임이 진행됨
- CSS는 canvas element 크기 등을 정하기만 함
- 게임 렌더링은 canvas API를 사용하여 JS로 구현
### 2. Basic JavaScript setup
- 파일 로딩이 완료되면 자동으로 실행되는 이벤트 핸들러를 통해 게임을 시작
### 3. Object Oriented Programming with JavaScript
- 클래스를 통해 각 세부 기능을 분리
### 4. Creating Player & Game objects
- canvas API의 fillStyle 메서드를 통해 색을 지정
- canvas API의 fillRect 메서드를 통해 사이즈를 규정
  - fillrect(x, y, width, height)
### 5. Animation loop
- animate 함수 생성
### 6. Keyboard inputs
- inputHandler 클래스 생성
- 클래스에서 화살표 함수 내부의 this vs 일반 함수 내부의 this
### 7. Creating projectiles
### 8. Periodic events
- 총알 자동 생성 기능
### 9. Draw game UI
- UI 클래스 생성
- 현재 총알 상태 반복문으로 구현
### 10. Base enemy class
- enemy x 좌표를 프레임이 지날때마다 작아지게 함
  - 속도를 변칙적으로 (Math.random() 활용)
- 시간이 지나며 자동 출현 (총알과 똑같이)
- 추상 클래스를 활용하여 각각의 적을 서브 클래스로 구현
### 11. Collision detection between rectangles
- 적과 플레이어의 충돌을 4가지 경우의 수로 가정하는 checkCollision 메서드
  - 적이 플레이어보다 왼쪽 위에서 x축 or y축 충돌
  - 적이 플레이어보다 오른쪽 아래에서 x축 or y축 충돌
  - 4가지 중 2가지 조건은 하나만 만족하면 자동 만족됨
  - 모두다 만족하면 true를 리턴
- 
### 12. Drawing game score
### 13. Win and lose condition
### 14. Counting game time
### 15. Animated parallax backgrounds
### 16. Sprite animation with JavaScript
### 17. Creating a debug mode
- 디버그 모드에서는 개체의 아웃라인이 표시되고 (히트 범위),
- 적의 잔여 라이프가 표시되게 할 것임
- D 버튼을 눌러 on off 가능케 함
### 18. Animating enemy sprite sheets
- 3종의 시트가 있기 때문에, random() * 3 으로 3종류를 랜덤하게 사용
### 19. Night Angler enemy class
- addEnemy 메서드에서 angler1, angler2 출현 확률을 절반씩으로 만듬
### 20. Lucky Fish enemy class
### 21. Collecting power ups
### 22. Drawing projectiles as images
### 23. Custom fonts and game text
### 24. Cleaning up
### 25. Particle effects and physics
### 26. Particle rotation
### 27. Tweaks and fixes
- 게임 실행시 자동으로 디버그 모드가 실행되지 않게 수정
- Game.draw 메서드에서 ui를 player 보다 먼저 draw해서, player가 ui보다 앞으로 오게 함
### 28. Hive Whale enemy class
### 29. Drone enemy class
### 30. Dust effect animation
### 31. Fire effect animation
### 32. Tuning game difficulty
### 33. Bulb Whale enemy class
### 34. Moon Fish enemy type
### 35. Sounds
### 36. Animated shield
### 37. Animated projectiles
### 38. What's next?
- 