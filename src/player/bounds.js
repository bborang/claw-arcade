export const STORE_BOUNDS = { minX: -3.8, maxX: 3.8, minZ: -3.8, maxZ: 3.8 }

export function clampToStore(character) {
  character.position.x = Math.max(STORE_BOUNDS.minX, Math.min(STORE_BOUNDS.maxX, character.position.x))
  character.position.z = Math.max(STORE_BOUNDS.minZ, Math.min(STORE_BOUNDS.maxZ, character.position.z))
}
