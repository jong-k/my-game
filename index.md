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
### 12. Drawing game score
### 13. Win and lose condition
### 14. Counting game time
### 15. Animated parallax backgrounds
### 16. Sprite animation with JavaScript
### 17. Creating a debug mode
### 18. Animating enemy sprite sheets
### 19. Night Angler enemy class
### 20. Lucky Fish enemy class
### 21. Collecting power ups
### 22. Drawing projectiles as images
### 23. Custom fonts and game text
### 24. Cleaning up
### 25. Particle effects and physics
### 26. Particle rotation
### 27. Tweaks and fixes
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