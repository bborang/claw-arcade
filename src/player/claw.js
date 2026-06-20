import * as THREE from 'three'
import { PEDESTAL_HEIGHT } from '../scene/buildStore.js'

const FINGER_COUNT = 3
const FINGER_OPEN_RADIUS = 0.18 // 인형(반지름 최대 0.1)보다 항상 바깥에서 시작하도록
const FINGER_MIN_RADIUS = 0.04 // 못 잡았을 때(빈손)만 이 정도까지 닫힘
const FINGER_HALF_THICKNESS = 0.02
const GRIP_CLEARANCE = 0.01
const FINGER_Y = -0.55

export function createClaw(machinePosition) {
  const claw = new THREE.Group()

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.1, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
  )

  const wire = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.4, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffbf00 })
  )
  wire.position.y = -0.25

  const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0xffcf40, metalness: 0.7 })
  const fingers = []
  for (let i = 0; i < FINGER_COUNT; i++) {
    const angle = (i / FINGER_COUNT) * Math.PI * 2
    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.04), fingerMaterial)
    finger.position.set(
      Math.sin(angle) * FINGER_OPEN_RADIUS,
      FINGER_Y,
      Math.cos(angle) * FINGER_OPEN_RADIUS
    )
    finger.userData.angle = angle
    fingers.push(finger)
  }

  claw.add(head, wire, ...fingers)
  claw.position.set(machinePosition.x, PEDESTAL_HEIGHT + 1.3, machinePosition.z)

  return { claw, fingers }
}

// t: 0(열림) ~ 1(닫힘). closedRadius를 안 주면 빈손 기준 최소 반지름까지 닫힘.
export function setFingersCloseAmount(fingers, t, closedRadius = FINGER_MIN_RADIUS) {
  const radius = THREE.MathUtils.lerp(FINGER_OPEN_RADIUS, closedRadius, t)
  for (const finger of fingers) {
    finger.position.x = Math.sin(finger.userData.angle) * radius
    finger.position.z = Math.cos(finger.userData.angle) * radius
  }
}

export function resetFingers(fingers) {
  setFingersCloseAmount(fingers, 0)
}

// 손가락이 잡은 물체의 표면 밖에 머물도록, 물체 반지름 기준 최소 닫힘 반지름 계산
export function getGripRadiusForObjectRadius(objectRadius) {
  return objectRadius + FINGER_HALF_THICKNESS + GRIP_CLEARANCE
}
