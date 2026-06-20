const legendEl = document.createElement('div')
legendEl.innerHTML = `
  <div>W 전진</div>
  <div>A / D 좌우 회전</div>
  <div>T 걷기 ↔ 집게 모드 전환</div>
  <div>WASD 집게 이동 (집게 모드)</div>
  <div>Space 집게 하강/잡기</div>
  <div>L 실내 LED 조명 on/off</div>
  <div> 1: FREE / 2: 3인칭 / 3: 1인칭시점 </div>
  <div>7 / 8 / 9 벽면 네온 사인 개별 on/off</div>
  <div>G 와이어프레임 토글</div>
  <div>H GI(Global Illumination) on/off</div>
  <div>P GI 프로브 마커 표시/숨김</div>
`
Object.assign(legendEl.style, {
  position: 'fixed',
  top: '16px',
  right: '16px',
  padding: '10px 14px',
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '13px',
  lineHeight: '1.6',
  borderRadius: '8px',
  pointerEvents: 'none',
  zIndex: '1000',
})
document.body.appendChild(legendEl)
