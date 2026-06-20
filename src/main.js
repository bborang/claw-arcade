import * as THREE from 'three'
import { setupScene } from './scene/setupScene.js'
import { buildStore, MACHINE_HALF, BG_MACHINE_HALF, HALF, DOOR_HALF_WIDTH } from './scene/buildStore.js'
import { loadCharacter } from './player/loadCharacter.js'
import { isMoving } from './player/input.js'
import { updateMovement } from './player/movement.js'
import { clampToStore } from './player/bounds.js'
import { updateThirdPersonCamera, snapThirdPersonCamera } from './player/thirdPersonCamera.js'
import { updateFirstPersonCamera } from './player/firstPersonCamera.js'
import { updateOperateCamera } from './player/operateCamera.js'
import { CameraMode, getCameraMode } from './player/cameraModes.js'
import { state } from './player/state.js'
import './player/modeToggle.js'
import './player/clawInput.js'
import './ui/koreanInputWarning.js'
import './ui/controlsLegend.js'
import { setInteractHintVisible } from './ui/interactHint.js'
import { createClaw } from './player/claw.js'
import { createClawBounds } from './player/clawBounds.js'
import { clawState } from './player/clawState.js'
import { createDolls } from './player/dolls.js'
import { updateClawMovement } from './player/clawMovement.js'
import { updateClawSequence } from './player/clawSequence.js'
import { resolveCircleCollision, resolveBoxCollision } from './player/collision.js'
import { setupPostProcessing } from './scene/postprocessing.js'
import { setupWireframeToggle } from './debug/wireframeToggle.js'
import { setupLightSwitch } from './scene/lightSwitch.js'
import { setupNeonToggle } from './scene/neonToggle.js'
import { setupCubeEnvironment } from './scene/environmentMap.js'
import { setupGI } from './scene/giProbes.js'

const CHARACTER_RADIUS = 0.3
const INTERACT_RADIUS = MACHINE_HALF + 0.5 // 기계 표면에서 0.5m 이내면 T 안내 표시
const DOLL_COUNT = 16
const BG_DOLL_COUNT = 8 // 배경 기계는 동작 안 하지만 안에 인형은 동일하게 채워둠

const { scene, camera, renderer, controls, hemiLight, directionalLight } = setupScene()
const { heroMachine, bgMachines, neonLights, ledLight, ledFixtureMaterial } = buildStore(scene)
const composer = setupPostProcessing(renderer, scene, camera)
setupWireframeToggle(scene)
setupLightSwitch({ hemiLight, directionalLight, ledLight, ledFixtureMaterial })
setupNeonToggle(neonLights)
setupCubeEnvironment(scene)

const machineColliders = [
  { position: heroMachine.position, radius: MACHINE_HALF + CHARACTER_RADIUS },
  ...bgMachines.map((m) => ({ position: m.position, radius: BG_MACHINE_HALF + CHARACTER_RADIUS })),
]

// 입구 옆 벽 — 문 틈으로만 지나갈 수 있게 박스 충돌 추가
const FRONT_WALL_THICKNESS = 0.2
const frontWallColliders = [
  {
    minX: -HALF,
    maxX: -DOOR_HALF_WIDTH,
    minZ: -HALF - FRONT_WALL_THICKNESS / 2,
    maxZ: -HALF + FRONT_WALL_THICKNESS / 2,
  },
  {
    minX: DOOR_HALF_WIDTH,
    maxX: HALF,
    minZ: -HALF - FRONT_WALL_THICKNESS / 2,
    maxZ: -HALF + FRONT_WALL_THICKNESS / 2,
  },
]

const clawBounds = createClawBounds(heroMachine.position)
const { claw, fingers } = createClaw(heroMachine.position)
scene.add(claw)
const dolls = createDolls(scene, clawBounds, DOLL_COUNT)

for (const machine of bgMachines) {
  const bgBounds = createClawBounds(machine.position, BG_MACHINE_HALF)
  createDolls(scene, bgBounds, BG_DOLL_COUNT)
}

const clock = new THREE.Clock()
let character = null
let mixer = null
let idleAction = null
let walkAction = null
let currentAction = null

loadCharacter(scene).then((result) => {
  character = result.model
  mixer = result.mixer
  idleAction = result.idleAction
  walkAction = result.walkAction
  currentAction = idleAction
  snapThirdPersonCamera(camera, character)
  character.traverse((obj) => {
    if (obj.isMesh) obj.castShadow = true
  })

  // 씬의 모든 요소가 갖춰진 뒤 한 번만 GI 프로브를 굽는다 (정적 bake)
  setupGI(renderer, scene, [character, claw], neonLights)
})

function updateAnimationState() {
  const nextAction = state.mode === 'walk' && isMoving() ? walkAction : idleAction
  if (nextAction !== currentAction) {
    nextAction.reset().play()
    currentAction.crossFadeTo(nextAction, 0.3, false)
    currentAction = nextAction
  }
}

function updateCamera() {
  if (state.mode === 'operate') {
    controls.enabled = false
    updateOperateCamera(camera, heroMachine)
    return
  }

  const mode = getCameraMode()
  controls.enabled = mode === CameraMode.FREE

  if (character) character.visible = mode !== CameraMode.FIRST // 1인칭은 카메라가 머리 위치라 몸이 시야를 가림

  if (mode === CameraMode.FREE) {
    controls.update()
  } else if (character) {
    if (mode === CameraMode.FOLLOW) updateThirdPersonCamera(camera, character)
    else if (mode === CameraMode.FIRST) updateFirstPersonCamera(camera, character)
  }
}

function animate() {
  requestAnimationFrame(animate)
  // 탭 전환 등으로 프레임이 끊기면 getDelta()가 수 초 단위로 튀어 캐릭터가 그만큼 순간이동함 — 한 프레임 최대치를 제한
  const delta = Math.min(clock.getDelta(), 0.1)

  if (character) {
    state.nearHeroMachine =
      state.mode === 'walk' && character.position.distanceTo(heroMachine.position) < INTERACT_RADIUS
    setInteractHintVisible(state.nearHeroMachine)

    updateAnimationState()
    mixer.update(delta)

    if (state.mode === 'walk') {
      updateMovement(character, delta)
      for (const collider of machineColliders) {
        resolveCircleCollision(character, collider.position, collider.radius)
      }
      for (const wallBox of frontWallColliders) {
        resolveBoxCollision(character, wallBox, CHARACTER_RADIUS)
      }
      clampToStore(character)
    }
  }

  if (state.mode === 'operate') {
    updateClawMovement(claw, clawBounds, clawState, delta)
    updateClawSequence(scene, claw, fingers, clawBounds, dolls, clawState, delta)
  }

  updateCamera()
  composer.render()
}
animate()
