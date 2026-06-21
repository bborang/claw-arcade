import { challengeState, CHALLENGE_TARGET, CHALLENGE_DURATION } from '../player/challenge.js'
import { state } from '../player/state.js'

const bestEl = document.createElement('div')
Object.assign(bestEl.style, {
  position: 'fixed',
  top: '16px',
  left: '16px',
  padding: '8px 14px',
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  borderRadius: '8px',
  pointerEvents: 'none',
  zIndex: '1000',
})
document.body.appendChild(bestEl)

const timerEl = document.createElement('div')
Object.assign(timerEl.style, {
  position: 'fixed',
  top: '60px',
  left: '16px',
  padding: '8px 14px',
  background: 'rgba(0,0,0,0.55)',
  color: '#ffd54a',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  borderRadius: '8px',
  pointerEvents: 'none',
  zIndex: '1000',
  display: 'none',
})
document.body.appendChild(timerEl)

const resultEl = document.createElement('div')
Object.assign(resultEl.style, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '24px 36px',
  background: 'rgba(0,0,0,0.8)',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '22px',
  textAlign: 'center',
  borderRadius: '12px',
  pointerEvents: 'none',
  zIndex: '1001',
  display: 'none',
})
document.body.appendChild(resultEl)

// T로 집게 모드에 들어온 즉시(클로 phase와 무관) ~ 챌린지 시작 전까지 표시
const startHintEl = document.createElement('div')
startHintEl.textContent = 'Enter를 눌러 30초 도전 시작!'
Object.assign(startHintEl.style, {
  position: 'fixed',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  background: 'rgba(0,0,0,0.6)',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  borderRadius: '6px',
  pointerEvents: 'none',
  zIndex: '1000',
  display: 'none',
})
document.body.appendChild(startHintEl)

let resultHideTimer = null

export function updateChallengeHud() {
  bestEl.textContent = `최고 기록: ${challengeState.best}개`

  const showStartHint = state.mode === 'operate' && !challengeState.active
  startHintEl.style.display = showStartHint ? 'block' : 'none'

  if (challengeState.active) {
    timerEl.style.display = 'block'
    timerEl.textContent = `도전 중 — ${Math.ceil(challengeState.timeLeft)}초 / ${challengeState.count} / ${CHALLENGE_TARGET}개`
  } else {
    timerEl.style.display = 'none'
  }

  if (challengeState.result) {
    const success = challengeState.result === 'success'
    resultEl.textContent = success
      ? `성공! ${CHALLENGE_DURATION}초 동안 ${challengeState.count}개를 넣었습니다`
      : `실패. ${CHALLENGE_DURATION}초 동안 ${challengeState.count}개 (목표 ${CHALLENGE_TARGET}개)`
    resultEl.style.color = success ? '#7CFFB2' : '#FF8A8A'
    resultEl.style.display = 'block'

    challengeState.result = null // 한 번만 보여주고 바로 소비
    clearTimeout(resultHideTimer)
    resultHideTimer = setTimeout(() => {
      resultEl.style.display = 'none'
    }, 3000)
  }
}
