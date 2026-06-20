import { keys } from './input.js'

const SPEED = 1.5

function lerpAngle(current, target, t) {
  let diff = target - current
  diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
  return current + diff * t
}

export function updateMovement(character, delta) {
  const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0)
  const moveZ = (keys.w ? 1 : 0) - (keys.s ? 1 : 0)
  if (moveX === 0 && moveZ === 0) return

  const length = Math.hypot(moveX, moveZ)
  const dirX = moveX / length
  const dirZ = moveZ / length

  character.position.x += dirX * SPEED * delta
  character.position.z += dirZ * SPEED * delta

  const targetRotation = Math.atan2(-dirX, dirZ)
  character.rotation.y = lerpAngle(character.rotation.y, targetRotation, 0.2)
}
