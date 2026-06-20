export const CameraMode = {
  FREE: 'free',
  FOLLOW: 'follow',
  FIRST: 'first',
}

let mode = CameraMode.FOLLOW

window.addEventListener('keydown', (e) => {
  if (e.key === '1') mode = CameraMode.FREE
  if (e.key === '2') mode = CameraMode.FOLLOW
  if (e.key === '3') mode = CameraMode.FIRST
})

export function getCameraMode() {
  return mode
}
