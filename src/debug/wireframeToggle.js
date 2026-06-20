let wireframeMode = false

export function setupWireframeToggle(scene) {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'g' && e.key !== 'G') return

    wireframeMode = !wireframeMode
    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => (m.wireframe = wireframeMode))
      } else {
        obj.material.wireframe = wireframeMode
      }
    })
  })
}
