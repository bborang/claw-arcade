import * as THREE from 'three'

const HEAD_OFFSET = new THREE.Vector3(0, 1.6, 0.2)
const FORWARD = new THREE.Vector3(0, 0, 1)
// 위치/회전을 그대로 스냅하면 그림자·블룸 등으로 프레임 타이밍이 살짝 불균일할 때 그 흔들림이
// 화면 전체(=카메라)에 그대로 드러나 뚝뚝 끊겨 보임 — 3인칭의 lerp(0.1)처럼 살짝만 보간해서 흡수.
// 입력 지연이 거의 안 느껴지는 수준으로 0.1보다는 높게(0.35) 잡음
const SMOOTH_FACTOR = 0.35

const lookMatrix = new THREE.Matrix4()
const targetQuat = new THREE.Quaternion()

export function updateFirstPersonCamera(camera, character) {
  const headOffset = HEAD_OFFSET.clone().applyQuaternion(character.quaternion)
  const targetPosition = character.position.clone().add(headOffset)
  camera.position.lerp(targetPosition, SMOOTH_FACTOR)

  const lookDir = FORWARD.clone().applyQuaternion(character.quaternion)
  const lookTarget = camera.position.clone().add(lookDir)
  lookMatrix.lookAt(camera.position, lookTarget, camera.up)
  targetQuat.setFromRotationMatrix(lookMatrix)
  camera.quaternion.slerp(targetQuat, SMOOTH_FACTOR)
}
