import * as THREE from 'three'
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js'

// 가게 안에 3x3 격자를 두 높이(1.5m, 3.0m)로 쌓아서 총 18개 균일 배치. 페이지 로드 시 한 번만 캡쳐하는 정적 bake 방식
// z=3.7 줄은 기계 캐비닛(최대 z=3.2) 바로 뒤라 모든 x에서 캐비닛과 안 겹침
const PROBE_X = [-2.5, 0, 2.5]
const PROBE_Z = [-3, 0, 3.7]
const PROBE_HEIGHTS = [1.5, 3.0]
const PROBE_POSITIONS = PROBE_HEIGHTS.flatMap((y) =>
  PROBE_Z.flatMap((z) => PROBE_X.map((x) => new THREE.Vector3(x, y, z)))
)
const PROBE_MARKER_RADIUS = 0.3

// LightProbe는 위치와 무관하게 전역으로 적용되기 때문에, 18개를 합치면 그대로 18배로 누적됨
// → 프로브당 강도를 1/N로 낮춰서 합산했을 때 과해지지 않게 함
const GI_ON_INTENSITY = 1.0 / PROBE_POSITIONS.length
const GI_OFF_INTENSITY = 0.0

const SH_Y00 = 0.282095 // sqrt(1 / (4π)) — SH 0차 계수를 평균 색으로 환산하는 상수

// LightProbe가 저장한 SH 0차(평균 irradiance) 계수를 실제 화면에 보일 색으로 환산
// — 네온 근처 프로브는 그 네온 색, 그 외에는 백색 LED 조명에 가까운 색이 나옴
function probeAverageColor(lightProbe) {
  const c = lightProbe.sh.coefficients[0]
  const color = new THREE.Color(c.x, c.y, c.z).multiplyScalar(SH_Y00)
  color.r = Math.min(1, Math.max(0, color.r))
  color.g = Math.min(1, Math.max(0, color.g))
  color.b = Math.min(1, Math.max(0, color.b))
  return color
}

// CubeCamera로 각 지점의 주변을 캡쳐해 LightProbe(SH irradiance)로 변환 — DDGI-lite
// neonLights: 굽는 순간에만 잠깐 켜서 캡쳐 — 평소 기본값(꺼짐)은 캡쳐 직후 그대로 복원
export async function setupGI(renderer, scene, occluders, neonLights = []) {
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  })
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)

  // 캐릭터/집게는 잠시 숨기기 (자기 자신이 캡쳐되어 이상한 색이 나오는 것 방지)
  for (const obj of occluders) obj.visible = false

  // 네온이 평소 꺼진 상태라도, 캡쳐 순간만큼은 켜서 색이 벽/바닥에 번지는 게 보이게 함
  const neonBackup = neonLights.map(({ material, rectLight }) => ({
    emissiveIntensity: material.emissiveIntensity,
    rectLightIntensity: rectLight.intensity,
  }))
  for (const { material, rectLight } of neonLights) {
    material.emissiveIntensity = 2.0
    rectLight.intensity = 5
  }

  // 프로브 위치를 눈으로 볼 수 있는 마커 — 각자 캡쳐한 SH 평균 색을 그대로 표시 (기본은 백색 LED에 가깝고, 네온 근처는 그 네온 색)
  const markerGeometry = new THREE.SphereGeometry(PROBE_MARKER_RADIUS, 16, 16)

  const probes = []
  const markers = []
  try {
    for (const position of PROBE_POSITIONS) {
      cubeCamera.position.copy(position)
      cubeCamera.update(renderer, scene)

      // fromCubeRenderTarget은 async 함수라 await 없이 쓰면 Promise 객체가 그대로 반환됨 — 빠뜨리기 쉬운 함정
      const lightProbe = await LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget)
      lightProbe.position.copy(position)
      lightProbe.intensity = GI_ON_INTENSITY
      scene.add(lightProbe)
      probes.push(lightProbe)

      const markerMaterial = new THREE.MeshBasicMaterial({
        color: probeAverageColor(lightProbe),
        toneMapped: false,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.copy(position)
      scene.add(marker)
      markers.push(marker)
    }
  } finally {
    // 캡쳐 중 에러가 나도 캐릭터/집게/네온은 반드시 원래 상태로 복원
    neonLights.forEach(({ material, rectLight }, i) => {
      material.emissiveIntensity = neonBackup[i].emissiveIntensity
      rectLight.intensity = neonBackup[i].rectLightIntensity
    })
    for (const obj of occluders) obj.visible = true
  }

  // 마커는 기본 숨김 — P로 보이거나 숨김 (GI on/off와 별개, 화면 밝기는 안 바뀜)
  let markersOn = false
  for (const marker of markers) marker.visible = markersOn

  // H: GI 조명 자체를 on/off (리포트용 GI ON/OFF 비교 스크린샷에 사용)
  let giOn = true
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
      giOn = !giOn
      for (const probe of probes) {
        probe.intensity = giOn ? GI_ON_INTENSITY : GI_OFF_INTENSITY
      }
    } else if (e.key === 'p' || e.key === 'P') {
      markersOn = !markersOn
      for (const marker of markers) {
        marker.visible = markersOn
      }
    }
  })

  return probes
}
