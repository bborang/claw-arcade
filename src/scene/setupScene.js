import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function setupScene() {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a14)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 9, -9)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace
  document.querySelector('#app').appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1, 0)
  controls.update()
  controls.enabled = false

  // 기본 LED 조명 — 가게 내부가 또렷하게 보이도록 중성광/높은 강도로 설정 (lightSwitch.js에서 L키로 토글)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x999999, 1.2)
  scene.add(hemiLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(3, 5, 4)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.set(2048, 2048)
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 20
  directionalLight.shadow.camera.left = -6
  directionalLight.shadow.camera.right = 6
  directionalLight.shadow.camera.top = 6
  directionalLight.shadow.camera.bottom = -6
  scene.add(directionalLight)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer, controls, hemiLight, directionalLight }
}
