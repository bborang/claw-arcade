import * as THREE from 'three'
import { setupScene } from './scene/setupScene.js'
import { buildStore, MACHINE_HALF, BG_MACHINE_HALF } from './scene/buildStore.js'
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
import { setInteractHintVisible } from './ui/interactHint.js'
import { createClaw } from './player/claw.js'
import { createClawBounds } from './player/clawBounds.js'
import { clawState } from './player/clawState.js'
import { createDolls } from './player/dolls.js'
import { updateClawMovement } from './player/clawMovement.js'
import { updateClawSequence } from './player/clawSequence.js'
import { resolveCircleCollision } from './player/collision.js'

const CHARACTER_RADIUS = 0.3
const INTERACT_RADIUS = MACHINE_HALF + 0.5 // 기계 표면에서 0.5m 이내면 T 안내 표시
const DOLL_COUNT = 16

const { scene, camera, renderer, controls } = setupScene()
const { heroMachine, bgMachines } = buildStore(scene)

const machineColliders = [
  { position: heroMachine.position, radius: MACHINE_HALF + CHARACTER_RADIUS },
  ...bgMachines.map((m) => ({ position: m.position, radius: BG_MACHINE_HALF + CHARACTER_RADIUS })),
]

const clawBounds = createClawBounds(heroMachine.position)
const { claw, fingers } = createClaw(heroMachine.position)
scene.add(claw)
const dolls = createDolls(scene, clawBounds, DOLL_COUNT)

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

  if (mode === CameraMode.FREE) {
    controls.update()
  } else if (character) {
    if (mode === CameraMode.FOLLOW) updateThirdPersonCamera(camera, character)
    else if (mode === CameraMode.FIRST) updateFirstPersonCamera(camera, character)
  }
}

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

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
      clampToStore(character)
    }
  }

  if (state.mode === 'operate') {
    updateClawMovement(claw, clawBounds, clawState, delta)
    updateClawSequence(scene, claw, fingers, clawBounds, dolls, clawState, delta)
  }

  updateCamera()
  renderer.render(scene, camera)
}
animate()
