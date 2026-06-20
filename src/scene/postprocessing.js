import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8, // strength
    0.4, // radius
    0.85 // threshold — 이 값보다 밝은 픽셀만 블룸
  )
  composer.addPass(bloomPass)

  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight)
  })

  return composer
}
