# 프로젝트 해부
## 플레이어 이동 기능은 어떻게 동작하는가?
### 담당 클래스 : InputHandler, Player, Game
- InputHandler 클래스의 ArrowUp, ArrowDown keydown 이벤트 핸들러가 key를 Game 클래스의 keys 배열에 push
- 하지만, 여러번 누르고 있어도 한 번만 푸시되게 했음 (키다운 - 키업이 1번씩 매칭되게 하기 위해)
- Game 클래스의 keys 배열에 ArrowUp 또는 ArrowDown이 있는지에 따라 Player.update 메서드가 Player.y를 수정
- 1frame마다 Player.maxSpeed에 비례해 위치 Player.y가 변화하고, Player.draw 메서드가 이를 렌더링
- 키업 이벤트가 발생하면 Game.keys 배열의 해당 키인 원소가 제거됨 (splice)

## 플레이어가 발사하는 투사체는 어떻게 동작하는가?
### 담당 클래스 : InputHandler, Projectile, Player
- InputHandler에서 스페이스바(' ') 키 다운 이벤트가 발생하면 Player.shootTop 메서드가 실행됨
  - Player 클래스는, 인수로 Game 클래스의 인스턴스를 받음에 주의
- shootTop 메서드는 game.ammo > 0 인 경우 (총알이 다 떨어지지 않은 경우) Player.projectiles 배열에 Projectile 인스턴스를 추가
  - 그리고 game.ammo-- 처리

## 에러1
### 담당 클래스 : Explosion
- Explosion.draw 에서 drawImage에 전달되는 인수 image가 null 인 상황이 있었다.
- 알고 보니 sub class에서 추상 프로퍼티인 image를 정의할때 getElementById 에 #을 넣은 채로 id 이름을 전달해서 생긴 문제엿음
- 타입 지정을 as로 강제하는 것이 이러한 문제를 만들었음... 대안이 필요할 듯 하다 옵셔널 체이닝 등등


## 후기
### 