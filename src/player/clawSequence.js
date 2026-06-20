import * as THREE from 'three'
import { tryGrabDoll, releaseDoll, getDollRadius } from './dollGrab.js'
import { setFingersCloseAmount, resetFingers, getGripRadiusForObjectRadius } from './claw.js'

const DESCEND_SPEED = 0.8
const ASCEND_SPEED = 0.6
const GRAB_DURATION = 0.4

export function updateClawSequence(scene, claw, fingers, bounds, dolls, clawState, delta) {
  if (clawState.phase === 'descending') {
    claw.position.y -= DESCEND_SPEED * delta
    if (claw.position.y <= bounds.bottomY) {
      claw.position.y = bounds.bottomY
      clawState.phase = 'grabbing'
      clawState.grabTimer = GRAB_DURATION
      tryGrabDoll(claw, dolls, clawState)
    }
  } else if (clawState.phase === 'grabbing') {
    clawState.grabTimer -= delta
    const t = 1 - clawState.grabTimer / GRAB_DURATION
    const closedRadius = clawState.attachedDoll
      ? getGripRadiusForObjectRadius(getDollRadius(clawState.attachedDoll))
      : undefined
    setFingersCloseAmount(fingers, t, closedRadius)
    if (clawState.grabTimer <= 0) clawState.phase = 'ascending'
  } else if (clawState.phase === 'ascending') {
    claw.position.y += ASCEND_SPEED * delta
    if (claw.position.y >= bounds.topY) {
      claw.position.y = bounds.topY
      clawState.phase = 'returning'
    }
  } else if (clawState.phase === 'returning') {
    const dropX = bounds.minX
    const dropZ = bounds.maxZ
    claw.position.x = THREE.MathUtils.lerp(claw.position.x, dropX, 0.05)
    claw.position.z = THREE.MathUtils.lerp(claw.position.z, dropZ, 0.05)
    if (Math.abs(claw.position.x - dropX) < 0.02 && Math.abs(claw.position.z - dropZ) < 0.02) {
      releaseDoll(scene, clawState, dolls)
      resetFingers(fingers)
      clawState.phase = 'idle'
    }
  }
}
