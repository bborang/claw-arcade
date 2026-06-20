import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { createFloorTexture, createWallTexture, createCeilingTexture } from './textures.js'

const WALL_HEIGHT = 4
const WALL_Y = WALL_HEIGHT / 2
const DOOR_HEIGHT = 2.5

const MACHINE_ROW_Z = 2.2 // 뒷벽(z=4)과 히어로 기계가 안 겹치도록

export const PEDESTAL_HEIGHT = 1 // 기계 받침대 높이 — 인형/집게 영역은 이 위부터 시작
export const MACHINE_HALF = 1.0 // 히어로 기계 (2m x 2m) 절반 폭
export const BG_MACHINE_HALF = 0.75 // 배경 기계 (1.5m x 1.5m) 절반 폭 — 높이는 히어로 기계와 동일
export const HALF = 4 // 가게 외곽 절반 폭 (8x8) — 충돌/경계 계산에서 재사용
export const DOOR_HALF_WIDTH = 1 // 문 절반 폭 — 충돌 계산에서 재사용
export const OUTDOOR_DEPTH = 8 // 입구 기준 밖으로 나갈 수 있는 8x8 영역

export function buildStore(scene) {
  // --- 바닥 ---
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2, HALF * 2),
    new THREE.MeshStandardMaterial({ color: 0x33303a, map: createFloorTexture() })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // --- 야외 바닥 (입구 기준 -Z 방향으로 8x8) ---
  const outdoorFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2, OUTDOOR_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x33303a, map: createFloorTexture() })
  )
  outdoorFloor.rotation.x = -Math.PI / 2
  outdoorFloor.position.set(0, 0, -HALF - OUTDOOR_DEPTH / 2)
  outdoorFloor.receiveShadow = true
  scene.add(outdoorFloor)

  // 색상을 어둡게 지정하면 텍스처가 그 색으로 곱해져서 잘 안 보임 — 흰색으로 둬서 텍스처 본연의 색이 보이게
  // 벽마다 크기가 달라서 같은 repeat 값을 쓰면 타일 밀도가 안 맞아 이상하게 보임 — 1타일당 TILE_METERS로 맞춤
  const TILE_METERS = 2
  // repeat을 정수로 반올림하면 벽마다 "실제 타일 크기(미터)"가 달라져 버림 — 문 위 헤더벽처럼
  // 작은 벽은 반올림 때문에 타일이 1개로 뭉개져서 훨씨 크게 보였던 게 원인. 그래서 repeat은
  // 항상 정확히 length/TILE_METERS로 고정해 타일 크기를 모든 벽에서 동일(2m)하게 맞추고,
  // 대신 각 벽의 왼쪽/아래쪽 모서리의 월드 좌표를 offset으로 넘겨 같은 격자 위에서 이어붙인다.
  const wallTextureFor = (width, height, originX = 0, originY = 0) => {
    const texture = createWallTexture(width / TILE_METERS, height / TILE_METERS)
    texture.offset.set(originX / TILE_METERS, originY / TILE_METERS)
    return texture
  }

  // --- 뒷벽 (+Z, 기본 시점 정면) ---
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(HALF * 2, WALL_HEIGHT, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wallTextureFor(HALF * 2, WALL_HEIGHT, -HALF, 0),
    })
  )
  backWall.position.set(0, WALL_Y, HALF)
  scene.add(backWall)

  // --- 좌/우 벽 ---
  const sideWallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: wallTextureFor(HALF * 2, WALL_HEIGHT, -HALF, 0),
  })
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, WALL_HEIGHT, HALF * 2), sideWallMaterial)
  leftWall.position.set(-HALF, WALL_Y, 0)
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, WALL_HEIGHT, HALF * 2), sideWallMaterial)
  rightWall.position.set(HALF, WALL_Y, 0)
  scene.add(rightWall)

  // --- 입구 벽 (-Z, 문틀만, 밖으로 나가는 기능은 구현 안 함) ---
  // 왼쪽/오른쪽 벽이 서로 다른 월드 X 위치에 있으므로 텍스처(특히 offset)를 따로 둬야
  // 문을 기준으로 같은 격자가 이어진다 — 텍스처를 공유하면 둘 다 같은 위상이 되어 어긋남
  const sideSegmentWidth = HALF - DOOR_HALF_WIDTH
  const frontLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry(sideSegmentWidth, WALL_HEIGHT, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wallTextureFor(sideSegmentWidth, WALL_HEIGHT, -HALF, 0),
    })
  )
  frontLeftWall.position.set(-(DOOR_HALF_WIDTH + sideSegmentWidth / 2), WALL_Y, -HALF)
  scene.add(frontLeftWall)

  const frontRightWall = new THREE.Mesh(
    new THREE.BoxGeometry(sideSegmentWidth, WALL_HEIGHT, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wallTextureFor(sideSegmentWidth, WALL_HEIGHT, DOOR_HALF_WIDTH, 0),
    })
  )
  frontRightWall.position.set(DOOR_HALF_WIDTH + sideSegmentWidth / 2, WALL_Y, -HALF)
  scene.add(frontRightWall)

  const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x222226 })
  const PILLAR_WIDTH = 0.2

  // 기둥은 문 안쪽에 딱 맞게 — 벽 경계선에 걸치면 겹쳐 보이는(z-fighting) 문제 발생
  const pillarX = DOOR_HALF_WIDTH - PILLAR_WIDTH / 2
  const leftPillar = new THREE.Mesh(
    new THREE.BoxGeometry(PILLAR_WIDTH, DOOR_HEIGHT, 0.2),
    doorFrameMaterial
  )
  leftPillar.position.set(-pillarX, DOOR_HEIGHT / 2, -HALF)
  scene.add(leftPillar)

  const rightPillar = new THREE.Mesh(
    new THREE.BoxGeometry(PILLAR_WIDTH, DOOR_HEIGHT, 0.2),
    doorFrameMaterial
  )
  rightPillar.position.set(pillarX, DOOR_HEIGHT / 2, -HALF)
  scene.add(rightPillar)

  // 상인방 — DOOR_HEIGHT 아래에 딱 붙게 (위쪽 벽과 겹치면 z-fighting으로 눈이 아픔)
  const LINTEL_HEIGHT = 0.2
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_HALF_WIDTH * 2, LINTEL_HEIGHT, 0.2),
    doorFrameMaterial
  )
  lintel.position.set(0, DOOR_HEIGHT - LINTEL_HEIGHT / 2, -HALF)
  scene.add(lintel)

  // 문 위 빈 공간을 채우는 벽 (DOOR_HEIGHT ~ WALL_HEIGHT) — 상인방 바로 위부터 시작해서 안 겹침
  const doorHeaderHeight = WALL_HEIGHT - DOOR_HEIGHT
  const doorHeaderWall = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_HALF_WIDTH * 2, doorHeaderHeight, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: wallTextureFor(DOOR_HALF_WIDTH * 2, doorHeaderHeight, -DOOR_HALF_WIDTH, DOOR_HEIGHT),
    })
  )
  doorHeaderWall.position.set(0, DOOR_HEIGHT + doorHeaderHeight / 2, -HALF)
  scene.add(doorHeaderWall)

  // --- 천장 (벽과 동일 텍스처/래핑) ---
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: createCeilingTexture(HALF * 2 / TILE_METERS, HALF * 2 / TILE_METERS),
  })
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), ceilingMaterial)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = WALL_HEIGHT
  scene.add(ceiling)

  // --- 히어로 기계 (속이 빈 프레임 — 안의 집게/인형이 보이도록 윗면 없음, 핑크/레드 계열) ---
  const heroMachine = buildMachineCabinet(0, MACHINE_ROW_Z, 0xff3366, 0xff0044)
  scene.add(heroMachine)

  // --- 배경 기계 2개 (히어로 기계의 70% 크기, 앞면을 히어로 기계 앞면과 맞춰서 정렬, 연두색 계열) ---
  const heroFrontZ = MACHINE_ROW_Z - MACHINE_HALF
  const bgMachineZ = heroFrontZ + BG_MACHINE_HALF
  const bgMachineXs = [-2.0, 2.0]
  const bgMachines = []
  for (const x of bgMachineXs) {
    const machine = buildMachineCabinet(x, bgMachineZ, 0x33cc66, 0x22aa44, BG_MACHINE_HALF)
    scene.add(machine)
    bgMachines.push(machine)
  }

  // --- 네온 사인 (벽마다 정중앙에 1개, 개별 토글용으로 참조 반환) ---
  const neonLights = buildNeonSigns(scene)

  // --- 가게 정중앙 천장에 실제로 빛이 나오는 LED 조명 (LED/네온 스위치에서 같이 토글) ---
  const { ledLight, ledFixtureMaterial } = buildLedFixture(scene)

  return { heroMachine, bgMachines, neonLights, ledLight, ledFixtureMaterial }
}

function buildLedFixture(scene) {
  const ledFixtureMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff4e0,
    emissive: 0xfff4e0,
    emissiveIntensity: 1.0,
    toneMapped: false, // 블룸이 잘 먹히도록 — 네온 사인과 동일한 방식
  })
  const FIXTURE_SIZE = 0.5
  const fixture = new THREE.Mesh(
    new THREE.BoxGeometry(FIXTURE_SIZE, 0.04, FIXTURE_SIZE),
    ledFixtureMaterial
  )
  fixture.position.set(0, WALL_HEIGHT - 0.02, 0) // 가게 정중앙 천장에 딱 붙임 (0.5x0.5m 사각 패널)
  scene.add(fixture)

  const ledLight = new THREE.PointLight(0xfff4e0, 4, 10, 2)
  ledLight.position.set(0, WALL_HEIGHT - 0.1, 0) // 조명 위치 = 실제 빛이 나오는 지점
  scene.add(ledLight)

  return { ledLight, ledFixtureMaterial }
}

function buildNeonSigns(scene) {
  const NEON_Y = 2.8 + 0.5 // 기존 위치보다 0.5m 높게
  // 벽마다 정중앙에 1개씩 — 뒷벽/좌측벽/우측벽 (문 있는 입구 벽은 제외)
  const signs = [
    { color: 0x00ffff, position: [0, NEON_Y, HALF - 0.15], rotationY: 0 }, // 뒷벽 중앙
    { color: 0xff00ff, position: [-HALF + 0.15, NEON_Y, 0], rotationY: Math.PI / 2 }, // 좌측벽 중앙
    { color: 0xffff00, position: [HALF - 0.15, NEON_Y, 0], rotationY: Math.PI / 2 }, // 우측벽 중앙
  ]

  RectAreaLightUniformsLib.init() // 빼먹으면 안 보임 — 단골 함정

  const neonLights = []
  for (const s of signs) {
    const material = new THREE.MeshStandardMaterial({
      color: s.color,
      emissive: s.color,
      emissiveIntensity: 0, // 기본값: 꺼짐 — 1/2/3 키로 개별 토글
      toneMapped: false, // 톤맵 무시해서 진짜 밝게 — 블룸이 잘 먹힘
    })
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.05), material)
    sign.position.set(...s.position)
    sign.rotation.y = s.rotationY
    scene.add(sign)

    const rectLight = new THREE.RectAreaLight(s.color, 0, 1.8, 0.3)
    rectLight.position.set(...s.position)
    rectLight.lookAt(0, 1, 0)
    scene.add(rectLight)

    neonLights.push({ material, rectLight })
  }

  return neonLights
}

function buildMachineCabinet(x, z, frameColor, emissiveColor, machineHalf = MACHINE_HALF) {
  const cabinet = new THREE.Group()
  cabinet.name = 'machineCabinet'
  cabinet.position.set(x, 0, z)

  const INTERIOR_HEIGHT = 1.5 // 받침대(1m) + 인테리어(1.5m) = 총 2.5m — 크기와 무관하게 높이는 동일

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    emissive: emissiveColor,
    emissiveIntensity: 0.3,
  })

  // 받침대 (0 ~ PEDESTAL_HEIGHT, 검은색)
  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(machineHalf * 2, PEDESTAL_HEIGHT, machineHalf * 2),
    pedestalMaterial
  )
  pedestal.position.y = PEDESTAL_HEIGHT / 2
  cabinet.add(pedestal)

  // 인형/집게 영역 바닥 (받침대 위)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(machineHalf * 2, 0.05, machineHalf * 2),
    frameMaterial
  )
  floor.position.y = PEDESTAL_HEIGHT + 0.025
  cabinet.add(floor)

  const pillarPositions = [
    [machineHalf, machineHalf],
    [machineHalf, -machineHalf],
    [-machineHalf, machineHalf],
    [-machineHalf, -machineHalf],
  ]
  for (const [px, pz] of pillarPositions) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, INTERIOR_HEIGHT, 0.05),
      frameMaterial
    )
    pillar.position.set(px, PEDESTAL_HEIGHT + INTERIOR_HEIGHT / 2, pz)
    cabinet.add(pillar)
  }

  // 배출 통로 (집게가 인형을 놓는 위치, clawBounds의 드롭 좌표와 맞춤 — 크기에 비례해서 스케일)
  const floorTopY = PEDESTAL_HEIGHT + 0.05 // floor 박스 윗면 — 통로 표시는 이 위에 그려야 안 가려짐
  const chuteOffset = machineHalf - 0.1
  const chuteSize = 0.18 * (machineHalf / MACHINE_HALF)
  buildChute(cabinet, -chuteOffset, chuteOffset, chuteSize, floorTopY)

  // 뚜껑 (핑크색 테두리만 — 가운데를 막으면 operate 카메라가 안을 못 봄)
  buildLidTrim(cabinet, machineHalf, PEDESTAL_HEIGHT + INTERIOR_HEIGHT, frameMaterial)

  cabinet.traverse((obj) => {
    if (!obj.isMesh) return
    obj.castShadow = true
    obj.receiveShadow = true
  })

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
