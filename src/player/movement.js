import { keys } from './input.js'

const SPEED = 1.5
const TURN_SPEED = 2.5 // A/D 회전 속도 (rad/sec)

export function updateMovement(character, delta) {
  if (keys.a) character.rotation.y += TURN_SPEED * delta
  if (keys.d) character.rotation.y -= TURN_SPEED * delta

  if (keys.w) {
    // 카메라들이 캐릭터 forward를 (0,0,1).applyQuaternion()으로 쓰는 것과 동일한 부호 — thirdPersonCamera.js / firstPersonCamera.js 참고
    character.position.x += Math.sin(character.rotation.y) * SPEED * delta
    character.position.z += Math.cos(character.rotation.y) * SPEED * delta
  }
}
