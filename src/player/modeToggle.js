import { state } from './state.js'

window.addEventListener('keydown', (e) => {
  if (e.key !== 't' && e.key !== 'T') return

  if (state.mode === 'walk' && state.nearHeroMachine) {
    state.mode = 'operate'
  } else if (state.mode === 'operate') {
    state.mode = 'walk'
  }
})
