import { state } from './state.js'
import { clawState } from './clawState.js'

window.addEventListener('keydown', (e) => {
  if (e.key !== ' ') return
  if (state.mode === 'operate' && clawState.phase === 'idle') {
    clawState.phase = 'descending'
  }
})
