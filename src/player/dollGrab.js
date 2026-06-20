import { PEDESTAL_HEIGHT } from '../scene/buildStore.js'

const GRAB_RADIUS = 0.2 // 정확히 안 맞아도 비슷한 위치면 잡히도록 여유를 둠
const GRIP_CHANCE = 0.6
const DESPAWN_DELAY = 1500 // 배출구에 놓인 뒤 사라지기까지(ms)

export function getDollRadius(doll) {
  return doll.geometry.parameters.radius ?? 0.1
}

export function tryGrabDoll(claw, dolls, clawState) {
  let nearest = null
  let nearestDist = Infinity
  for (const doll of dolls) {
    if (doll.parent === claw) continue
    const dx = doll.position.x - claw.position.x
    const dz = doll.position.z - claw.position.z
    const dist = Math.hypot(dx, dz)
    if (dist < GRAB_RADIUS && dist < nearestDist) {
      nearest = doll
      nearestDist = dist
    }
  }

  if (nearest && Math.random() < GRIP_CHANCE) {
    claw.attach(nearest) // attach: 월드 좌표 보존하며 부모만 변경
    nearest.position.set(0, -0.55, 0)
    clawState.attachedDoll = nearest
  }
}

export function releaseDoll(scene, clawState, dolls) {
  if (clawState.attachedDoll) {
    const doll = clawState.attachedDoll
    scene.attach(doll)
    doll.position.y = PEDESTAL_HEIGHT + 0.15
    clawState.attachedDoll = null

    setTimeout(() => {
      scene.remove(doll)
      const index = dolls.indexOf(doll)
      if (index !== -1) dolls.splice(index, 1)
    }, DESPAWN_DELAY)
  }
}
