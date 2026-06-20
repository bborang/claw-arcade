export function resolveCircleCollision(character, colliderPosition, radius) {
  const dx = character.position.x - colliderPosition.x
  const dz = character.position.z - colliderPosition.z
  const dist = Math.hypot(dx, dz)
  if (dist < radius && dist > 0.0001) {
    const scale = radius / dist
    character.position.x = colliderPosition.x + dx * scale
    character.position.z = colliderPosition.z + dz * scale
  }
}

// 사각형(벽 등) vs 캐릭터 원 충돌 — 문틀 옆 벽처럼 문 틈으로만 지나가게 막을 때 사용
export function resolveBoxCollision(character, box, radius) {
  const closestX = Math.max(box.minX, Math.min(character.position.x, box.maxX))
  const closestZ = Math.max(box.minZ, Math.min(character.position.z, box.maxZ))
  const dx = character.position.x - closestX
  const dz = character.position.z - closestZ
  const dist = Math.hypot(dx, dz)
  if (dist < radius && dist > 0.0001) {
    const scale = (radius - dist) / dist
    character.position.x += dx * scale
    character.position.z += dz * scale
  }
}
