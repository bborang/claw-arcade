const hintEl = document.createElement('div')
hintEl.textContent = 'Press T to operate'
Object.assign(hintEl.style, {
  position: 'fixed',
  bottom: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  background: 'rgba(0,0,0,0.6)',
  color: '#fff',
  fontFamily: 'sans-serif',
  borderRadius: '6px',
  display: 'none',
  pointerEvents: 'none',
})
document.body.appendChild(hintEl)

export function setInteractHintVisible(visible) {
  hintEl.style.display = visible ? 'block' : 'none'
}
