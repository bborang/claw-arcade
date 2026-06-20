import { PEDESTAL_HEIGHT, MACHINE_HALF } from '../scene/buildStore.js'

export function createClawBounds(machinePosition, machineHalf = MACHINE_HALF) {
  const margin = machineHalf - 0.1
  return {
    minX: machinePosition.x - margin,
    maxX: machinePosition.x + margin,
    minZ: machinePosition.z - margin,
    maxZ: machinePosition.z + margin,
    topY: PEDESTAL_HEIGHT + 1.3, // 인테리어 천장(1.5m)에서 여유 0.2m
    bottomY: PEDESTAL_HEIGHT + 0.7, // 손가락(로컬 -0.55)이 받침대 위 인형(y≈+0.15) 근처까지 내려가도록
  }
}
