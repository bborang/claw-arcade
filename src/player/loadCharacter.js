import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { SPEED } from './movement.js'

const loader = new FBXLoader()
const MODEL_SCALE = 0.01 // FBX 원본 단위(cm) → 미터. idleModel.scale와 동일한 값을 root motion 거리 계산에도 씀

function loadFBX(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}

// Mixamo 워크 클립은 Hips 본의 Z 위치에 전진 이동(root motion)이 baked 되어 있는데,
// movement.js가 character.position을 별도로 전진시키고 있어서 그대로 두면 이동이 중복된다.
// 게다가 클립의 시작 Z(0.75)와 끝 Z(182.09, raw 단위)가 달라서 루프가 끝날 때마다 Hips가
// 뒤로 순간 리셋되어 "다리가 끊기는" 것처럼 보임 — Hips XZ를 첫 프레임 값으로 고정해
// 애니메이션을 in-place로 만들고, 원래 클립이 내던 속도(m/s)를 반환해 timeScale로 보폭을 맞춘다.
function stripRootMotion(clip) {
  const track = clip.tracks.find((t) => /hips/i.test(t.name) && t.name.endsWith('.position'))
  if (!track) return null

  const values = track.values
  const count = values.length / 3
  const startX = values[0]
  const startZ = values[2]
  const endZ = values[(count - 1) * 3 + 2]

  for (let i = 0; i < count; i++) {
    values[i * 3] = startX
    values[i * 3 + 2] = startZ
  }

  const distanceMeters = Math.abs(endZ - startZ) * MODEL_SCALE
  return distanceMeters / clip.duration
}

export async function loadCharacter(scene) {
  const [idleModel, idleOrcModel, walkModel] = await Promise.all([
    loadFBX(`${import.meta.env.BASE_URL}models/character-idle.fbx`),
    loadFBX(`${import.meta.env.BASE_URL}models/character-idle-orc.fbx`),
    loadFBX(`${import.meta.env.BASE_URL}models/character-walk.fbx`),
  ])

  idleModel.scale.setScalar(MODEL_SCALE)
  idleModel.position.set(0, 0, 0)
  scene.add(idleModel)

  const walkClip = walkModel.animations[0]
  const naturalWalkSpeed = stripRootMotion(walkClip)

  const mixer = new THREE.AnimationMixer(idleModel)
  const idleAction = mixer.clipAction(idleOrcModel.animations[0])
  const walkAction = mixer.clipAction(walkClip)
  if (naturalWalkSpeed > 0) walkAction.timeScale = SPEED / naturalWalkSpeed // 다리 보폭 속도를 실제 이동 속도에 맞춤
  idleAction.play()

  return { model: idleModel, mixer, idleAction, walkAction }
}
