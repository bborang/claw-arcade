import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

const loader = new FBXLoader()

function loadFBX(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}

export async function loadCharacter(scene) {
  const [idleModel, idleOrcModel, walkModel] = await Promise.all([
    loadFBX(`${import.meta.env.BASE_URL}models/character-idle.fbx`),
    loadFBX(`${import.meta.env.BASE_URL}models/character-idle-orc.fbx`),
    loadFBX(`${import.meta.env.BASE_URL}models/character-walk.fbx`),
  ])

  idleModel.scale.setScalar(0.01)
  idleModel.position.set(0, 0, 0)
  scene.add(idleModel)

  const mixer = new THREE.AnimationMixer(idleModel)
  const idleAction = mixer.clipAction(idleOrcModel.animations[0])
  const walkAction = mixer.clipAction(walkModel.animations[0])
  idleAction.play()

  return { model: idleModel, mixer, idleAction, walkAction }
}
