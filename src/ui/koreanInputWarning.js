const KOREAN_REGEX = /[㄰-㆏가-힣]/
const HIDE_DELAY = 2500

const warningEl = document.createElement('div')
warningEl.textContent = '한글 입력 상태에서는 조작이 되지 않습니다. 키보드를 영어로 전환해주세요.'
Object.assign(warningEl.style, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '16px 24px',
  maxWidth: '80vw',
  background: 'rgba(0,0,0,0.75)',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '18px',
  textAlign: 'center',
  borderRadius: '8px',
  display: 'none',
  pointerEvents: 'none',
  zIndex: '1000',
})
document.body.appendChild(warningEl)

let hideTimer = null

window.addEventListener('keydown', (e) => {
  if (!KOREAN_REGEX.test(e.key)) return
  warningEl.style.display = 'block'
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    warningEl.style.display = 'none'
  }, HIDE_DELAY)
})
