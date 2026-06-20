export const keys = { w: false, a: false, s: false, d: false }

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase()
  if (key in keys) keys[key] = true
})

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase()
  if (key in keys) keys[key] = false
})

export function isMoving() {
  // 캐릭터 이동(walk 모드)에서는 S가 더 이상 아무 동작도 하지 않음 — 집게(operate 모드)는 별도로 keys.s를 사용
  return keys.w || keys.a || keys.d
}
