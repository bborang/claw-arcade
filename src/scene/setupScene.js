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
  document.querySelector('#app').appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1, 0)
  controls.update()
  controls.enabled = false

  const hemiLight = new THREE.HemisphereLight(0x1a2540, 0x0a0a0c, 0.6)
  scene.add(hemiLight)

  const directionalLight = new THREE.DirectionalLight(0x8fa8ff, 0.5)
  directionalLight.position.set(3, 4, 5)
  scene.add(directionalLight)

  // 작업용 임시 조명 (밤 분위기 잡는 8단계에서 빼거나 줄일 것)
  const workLight = new THREE.DirectionalLight(0xffffff, 2.5)
  workLight.position.set(0, 25, -5)
  scene.add(workLight)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer, controls }
}
