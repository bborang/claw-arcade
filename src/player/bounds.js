import { HALF, OUTDOOR_DEPTH } from '../scene/buildStore.js'

// 가게 내부(8x8) + 입구 기준 야외(8x8)를 합친 영역. x축 폭은 동일하므로 z만 확장하면 됨
export const STORE_BOUNDS = {
  minX: -HALF + 0.2,
  maxX: HALF - 0.2,
  minZ: -HALF - OUTDOOR_DEPTH + 0.2,
  maxZ: HALF - 0.2,
}

export function clampToStore(character) {
  character.position.x = Math.max(STORE_BOUNDS.minX, Math.min(STORE_BOUNDS.maxX, character.position.x))
  character.position.z = Math.max(STORE_BOUNDS.minZ, Math.min(STORE_BOUNDS.maxZ, character.position.z))
}
