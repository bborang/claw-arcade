import * as THREE from 'three'

const OFFSET = new THREE.Vector3(0, 1.8, -3)

function getTargetPos(character) {
  const offsetWorld = OFFSET.clone().applyQuaternion(character.quaternion)
  return character.position.clone().add(offsetWorld)
}

export function updateThirdPersonCamera(camera, character) {
  camera.position.lerp(getTargetPos(character), 0.1)
  camera.lookAt(character.position.x, character.position.y + 1.2, character.position.z)
}

export function snapThirdPersonCamera(camera, character) {
  camera.position.copy(getTargetPos(character))
  camera.lookAt(character.position.x, character.position.y + 1.2, character.position.z)
}
