import { state } from './state.js'

export const CHALLENGE_DURATION = 30 // 초
export const CHALLENGE_TARGET = 5 // 이 개수 이상 넣으면 성공 

export const challengeState = {
  active: false,
  timeLeft: 0,
  count: 0,
  best: 0, // 새로고침 전까지만 유지되는 세션 내 최고 기록 (의도적으로 localStorage 사용 안 함)
  result: null, // 챌린지가 막 끝난 순간에만 'success' | 'fail', HUD가 소비하면 다시 null
}

export function startChallenge() {
  if (challengeState.active) return
  challengeState.active = true
  challengeState.timeLeft = CHALLENGE_DURATION
  challengeState.count = 0
  challengeState.result = null
}

// 집게가 인형을 배출구까지 성공적으로 가져왔을 때만 호출 (clawSequence.js)
export function registerChallengeCatch() {
  if (!challengeState.active) return
  challengeState.count += 1
}

export function updateChallenge(delta) {
  if (!challengeState.active) return
  challengeState.timeLeft -= delta
  if (challengeState.timeLeft <= 0) {
    challengeState.timeLeft = 0
    challengeState.active = false
    challengeState.best = Math.max(challengeState.best, challengeState.count)
    challengeState.result = challengeState.count >= CHALLENGE_TARGET ? 'success' : 'fail'
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return
  // 집게가 사이클 중이어도 시작 가능 — phase 조건은 필요 없고, T로 들어온 즉시 시작할 수 있어야 함
  if (state.mode === 'operate') startChallenge()
})
