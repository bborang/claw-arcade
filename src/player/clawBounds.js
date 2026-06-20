import { PEDESTAL_HEIGHT } from '../scene/buildStore.js'

export function createClawBounds(machinePosition) {
  return {
    minX: machinePosition.x - 0.9,
    maxX: machinePosition.x + 0.9,
    minZ: machinePosition.z - 0.9,
    maxZ: machinePosition.z + 0.9,
    topY: PEDESTAL_HEIGHT + 1.3, // 인테리어 천장(1.5m)에서 여유 0.2m
    bottomY: PEDESTAL_HEIGHT + 0.7, // 손가락(로컬 -0.55)이 받침대 위 인형(y≈+0.15) 근처까지 내려가도록
  }
}
