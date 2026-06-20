import { keys } from './input.js'

const SPEED = 1.8 

export function updateClawMovement(claw, bounds, clawState, delta) {
  if (clawState.phase !== 'idle') return

  if (keys.w) claw.position.z += SPEED * delta
  if (keys.s) claw.position.z -= SPEED * delta
  if (keys.a) claw.position.x += SPEED * delta
  if (keys.d) claw.position.x -= SPEED * delta

  claw.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, claw.position.x))
  claw.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, claw.position.z))
}
