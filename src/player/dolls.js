import * as THREE from 'three'
import { PEDESTAL_HEIGHT } from '../scene/buildStore.js'

const dollMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xff88aa }),
  new THREE.MeshStandardMaterial({ color: 0xcbdaff }),
  new THREE.MeshStandardMaterial({ color: 0xa6e28d }),
]
const dollGeometries = [
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.CapsuleGeometry(0.08, 0.12, 4, 8),
]

const MIN_DOLL_DISTANCE = 0.24
const MARGIN = 0.06
const MAX_ATTEMPTS = 80

function pickNonOverlappingXZ(bounds, placed) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = THREE.MathUtils.randFloat(bounds.minX + MARGIN, bounds.maxX - MARGIN)
    const z = THREE.MathUtils.randFloat(bounds.minZ + MARGIN, bounds.maxZ - MARGIN)
    const farEnough = placed.every((p) => Math.hypot(p.x - x, p.z - z) >= MIN_DOLL_DISTANCE)
    if (farEnough) return { x, z }
  }
  // 자리를 못 찾으면 마지막 시도 위치라도 반환 (대신 거리 제약 없이)
  return {
    x: THREE.MathUtils.randFloat(bounds.minX + MARGIN, bounds.maxX - MARGIN),
    z: THREE.MathUtils.randFloat(bounds.minZ + MARGIN, bounds.maxZ - MARGIN),
  }
}

export function createDolls(scene, bounds, count = 8) {
  const dolls = []
  const placed = []
  for (let i = 0; i < count; i++) {
    const geometry = dollGeometries[i % dollGeometries.length]
    const material = dollMaterials[i % dollMaterials.length]
    const doll = new THREE.Mesh(geometry, material)

    const { x, z } = pickNonOverlappingXZ(bounds, placed)
    doll.position.set(x, PEDESTAL_HEIGHT + 0.15, z)
    placed.push({ x, z })

    scene.add(doll)
    dolls.push(doll)
  }
  return dolls
}
