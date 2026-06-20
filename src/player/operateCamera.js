import * as THREE from 'three'
import { PEDESTAL_HEIGHT } from '../scene/buildStore.js'

const OFFSET = new THREE.Vector3(0, PEDESTAL_HEIGHT + 1.7, -0.8)
const TARGET_OFFSET = new THREE.Vector3(0, PEDESTAL_HEIGHT + 0.3, 0.3)

export function updateOperateCamera(camera, heroMachine) {
  const targetPos = heroMachine.position.clone().add(OFFSET)
  camera.position.lerp(targetPos, 0.08)
  camera.lookAt(heroMachine.position.clone().add(TARGET_OFFSET))
}
