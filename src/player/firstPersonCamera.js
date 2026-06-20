import * as THREE from 'three'

// 기초 버전: 머리 위치에서 캐릭터가 보는 방향을 바라봄 
const HEAD_OFFSET = new THREE.Vector3(0, 1.6, 0.2)
const FORWARD = new THREE.Vector3(0, 0, 1)

export function updateFirstPersonCamera(camera, character) {
  const headOffset = HEAD_OFFSET.clone().applyQuaternion(character.quaternion)
  camera.position.copy(character.position).add(headOffset)

  const lookDir = FORWARD.clone().applyQuaternion(character.quaternion)
  const lookTarget = camera.position.clone().add(lookDir)
  camera.lookAt(lookTarget)
}
