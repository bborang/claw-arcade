// 가게 메인 조명(LED) on/off — 네온 사인은 neonToggle.js에서 개별로 따로 제어
export function setupLightSwitch({ hemiLight, directionalLight, ledLight, ledFixtureMaterial }) {
  const ledIntensity = {
    hemi: hemiLight.intensity,
    directional: directionalLight.intensity,
    point: ledLight.intensity,
    fixtureEmissive: ledFixtureMaterial.emissiveIntensity,
  }
  let ledOn = true

  function apply() {
    hemiLight.intensity = ledOn ? ledIntensity.hemi : 0
    directionalLight.intensity = ledOn ? ledIntensity.directional : 0
    ledLight.intensity = ledOn ? ledIntensity.point : 0
    ledFixtureMaterial.emissiveIntensity = ledOn ? ledIntensity.fixtureEmissive : 0
  }

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'l' && e.key !== 'L') return
    ledOn = !ledOn
    apply()
  })
}
