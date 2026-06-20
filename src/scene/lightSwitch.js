const NEON_EMISSIVE_INTENSITY = 2.0
const NEON_RECT_LIGHT_INTENSITY = 5

export function setupLightSwitch({ hemiLight, directionalLight, neonMaterials, rectLight }) {
  const ledIntensity = { hemi: hemiLight.intensity, directional: directionalLight.intensity }
  let neonOn = false

  function apply() {
    hemiLight.intensity = neonOn ? 0 : ledIntensity.hemi
    directionalLight.intensity = neonOn ? 0 : ledIntensity.directional
    for (const material of neonMaterials) {
      material.emissiveIntensity = neonOn ? NEON_EMISSIVE_INTENSITY : 0
    }
    rectLight.intensity = neonOn ? NEON_RECT_LIGHT_INTENSITY : 0
  }

  apply() // 기본값: LED 켜짐, 네온 꺼짐

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'l' && e.key !== 'L') return
    neonOn = !neonOn
    apply()
  })
}
