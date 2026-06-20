const NEON_EMISSIVE_INTENSITY = 2.0
const NEON_RECT_LIGHT_INTENSITY = 5
const TOGGLE_KEYS = ['8', '9', '7']

// 네온 사인을 하나씩 원하는 것만 켜고 끌 수 있게 — 키 7/8/9이 각 벽의 네온에 대응 (기본값: 전부 꺼짐)
export function setupNeonToggle(neonLights) {
  const isOn = neonLights.map(() => false)

  function apply(index) {
    const { material, rectLight } = neonLights[index]
    material.emissiveIntensity = isOn[index] ? NEON_EMISSIVE_INTENSITY : 0
    rectLight.intensity = isOn[index] ? NEON_RECT_LIGHT_INTENSITY : 0
  }

  window.addEventListener('keydown', (e) => {
    const index = TOGGLE_KEYS.indexOf(e.key)
    if (index === -1 || index >= neonLights.length) return
    isOn[index] = !isOn[index]
    apply(index)
  })
}
