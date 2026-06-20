import * as THREE from 'three'

const HALF = 4 // 8x8 가게, 중앙(0,0,0) 기준
const WALL_HEIGHT = 4
const WALL_Y = WALL_HEIGHT / 2
const DOOR_HALF_WIDTH = 1
const DOOR_HEIGHT = 2.4

const MACHINE_ROW_Z = 2.2 // 뒷벽(z=4)과 히어로 기계가 안 겹치도록

export const PEDESTAL_HEIGHT = 1 // 기계 받침대 높이 — 인형/집게 영역은 이 위부터 시작
export const MACHINE_HALF = 1.0 // 히어로 기계 (2m x 2m) 절반 폭
export const BG_MACHINE_HALF = 0.4 // 배경 기계 (0.8m x 0.8m) 절반 폭

export function buildStore(scene) {
  // --- 바닥 ---
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2, HALF * 2),
    new THREE.MeshStandardMaterial({ color: 0x33303a })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4550 })

  // --- 뒷벽 (+Z, 기본 시점 정면) ---
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2, WALL_HEIGHT, 0.2), wallMaterial)
  backWall.position.set(0, WALL_Y, HALF)
  scene.add(backWall)

  // --- 좌/우 벽 ---
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, WALL_HEIGHT, HALF * 2), wallMaterial)
  leftWall.position.set(-HALF, WALL_Y, 0)
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, WALL_HEIGHT, HALF * 2), wallMaterial)
  rightWall.position.set(HALF, WALL_Y, 0)
  scene.add(rightWall)

  // --- 입구 벽 (-Z, 문틀만, 밖으로 나가는 기능은 구현 안 함) ---
  const sideSegmentWidth = HALF - DOOR_HALF_WIDTH
  const frontLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry(sideSegmentWidth, WALL_HEIGHT, 0.2),
    wallMaterial
  )
  frontLeftWall.position.set(-(DOOR_HALF_WIDTH + sideSegmentWidth / 2), WALL_Y, -HALF)
  scene.add(frontLeftWall)

  const frontRightWall = new THREE.Mesh(
    new THREE.BoxGeometry(sideSegmentWidth, WALL_HEIGHT, 0.2),
    wallMaterial
  )
  frontRightWall.position.set(DOOR_HALF_WIDTH + sideSegmentWidth / 2, WALL_Y, -HALF)
  scene.add(frontRightWall)

  const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x222226 })

  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.2, DOOR_HEIGHT, 0.2), doorFrameMaterial)
  leftPillar.position.set(-DOOR_HALF_WIDTH, DOOR_HEIGHT / 2, -HALF)
  scene.add(leftPillar)

  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.2, DOOR_HEIGHT, 0.2), doorFrameMaterial)
  rightPillar.position.set(DOOR_HALF_WIDTH, DOOR_HEIGHT / 2, -HALF)
  scene.add(rightPillar)

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_HALF_WIDTH * 2 + 0.2, 0.2, 0.2),
    doorFrameMaterial
  )
  lintel.position.set(0, DOOR_HEIGHT, -HALF)
  scene.add(lintel)

  // --- 배경 기계 2개 (솔리드 박스, 장식용 — 히어로 기계와 안 겹치게 좌우로 이동) ---
  const machineMaterial = new THREE.MeshStandardMaterial({ color: 0x55525c })
  const bgMachineXs = [-2, 2]
  const bgMachines = []
  for (const x of bgMachineXs) {
    const machine = new THREE.Mesh(
      new THREE.BoxGeometry(BG_MACHINE_HALF * 2, 1.8, BG_MACHINE_HALF * 2),
      machineMaterial
    )
    machine.position.set(x, 0.9, MACHINE_ROW_Z)
    scene.add(machine)
    bgMachines.push(machine)
  }

  // --- 히어로 기계 (속이 빈 프레임 — 안의 집게/인형이 보이도록 윗면 없음) ---
  const heroMachine = buildHeroMachineCabinet(0, MACHINE_ROW_Z)
  scene.add(heroMachine)

  return { heroMachine, bgMachines }
}

function buildHeroMachineCabinet(x, z) {
  const cabinet = new THREE.Group()
  cabinet.name = 'heroMachine'
  cabinet.position.set(x, 0, z)

  const INTERIOR_HEIGHT = 1.5 // 받침대(1m) + 인테리어(1.5m) = 총 2.5m

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3366,
    emissive: 0xff0044,
    emissiveIntensity: 0.3,
  })

  // 받침대 (0 ~ PEDESTAL_HEIGHT, 검은색)
  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(MACHINE_HALF * 2, PEDESTAL_HEIGHT, MACHINE_HALF * 2),
    pedestalMaterial
  )
  pedestal.position.y = PEDESTAL_HEIGHT / 2
  cabinet.add(pedestal)

  // 인형/집게 영역 바닥 (받침대 위)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(MACHINE_HALF * 2, 0.05, MACHINE_HALF * 2),
    frameMaterial
  )
  floor.position.y = PEDESTAL_HEIGHT + 0.025
  cabinet.add(floor)

  const pillarPositions = [
    [MACHINE_HALF, MACHINE_HALF],
    [MACHINE_HALF, -MACHINE_HALF],
    [-MACHINE_HALF, MACHINE_HALF],
    [-MACHINE_HALF, -MACHINE_HALF],
  ]
  for (const [px, pz] of pillarPositions) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, INTERIOR_HEIGHT, 0.05),
      frameMaterial
    )
    pillar.position.set(px, PEDESTAL_HEIGHT + INTERIOR_HEIGHT / 2, pz)
    cabinet.add(pillar)
  }

  // 배출 통로 (집게가 인형을 놓는 위치, clawBounds의 드롭 좌표와 맞춤)
  const floorTopY = PEDESTAL_HEIGHT + 0.05 // floor 박스 윗면 — 통로 표시는 이 위에 그려야 안 가려짐
  buildChute(cabinet, -0.9, 0.9, 0.18, floorTopY)

  // 뚜껑 (핑크색 테두리만 — 가운데를 막으면 operate 카메라가 안을 못 봄)
  buildLidTrim(cabinet, MACHINE_HALF, PEDESTAL_HEIGHT + INTERIOR_HEIGHT, frameMaterial)

  return cabinet
}

function buildChute(cabinet, x, z, size, floorTopY) {
  const openingMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(size, size), openingMaterial)
  opening.rotation.x = -Math.PI / 2
  opening.position.set(x, floorTopY + 0.002, z)
  cabinet.add(opening)

  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0x222226 })
  const rimThickness = 0.03
  const rimHeight = 0.04
  const sides = [
    { w: size + rimThickness * 2, d: rimThickness, dx: 0, dz: size / 2 },
    { w: size + rimThickness * 2, d: rimThickness, dx: 0, dz: -size / 2 },
    { w: rimThickness, d: size, dx: size / 2, dz: 0 },
    { w: rimThickness, d: size, dx: -size / 2, dz: 0 },
  ]
  for (const s of sides) {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(s.w, rimHeight, s.d), rimMaterial)
    rim.position.set(x + s.dx, floorTopY + rimHeight / 2, z + s.dz)
    cabinet.add(rim)
  }
}

function buildLidTrim(cabinet, machineHalf, topY, material) {
  const trimWidth = 0.15
  const trimHeight = 0.08
  const outer = machineHalf
  const inner = machineHalf - trimWidth
  const sides = [
    { w: outer * 2, d: trimWidth, dx: 0, dz: inner + trimWidth / 2 },
    { w: outer * 2, d: trimWidth, dx: 0, dz: -(inner + trimWidth / 2) },
    { w: trimWidth, d: outer * 2, dx: inner + trimWidth / 2, dz: 0 },
    { w: trimWidth, d: outer * 2, dx: -(inner + trimWidth / 2), dz: 0 },
  ]
  for (const s of sides) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(s.w, trimHeight, s.d), material)
    trim.position.set(s.dx, topY + trimHeight / 2, s.dz)
    cabinet.add(trim)
  }
}
