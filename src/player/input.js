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
  return keys.w || keys.a || keys.s || keys.d
}
