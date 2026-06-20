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
