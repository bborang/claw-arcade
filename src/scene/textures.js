import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader()
const FLOOR_TEXTURE_PATH = 'textures/floor/floor.jpg'
const WALL_TEXTURE_PATH = 'textures/floor/celling.jpg'

function loadTexture(path, wrapMode, repeatX, repeatY) {
  const texture = textureLoader.load(
    `${import.meta.env.BASE_URL}${path}`,
    undefined,
    undefined,
    (error) => console.warn(`텍스처 로드 실패: public/${path} 파일이 있는지 확인하세요.`, error)
  )
  texture.wrapS = wrapMode
  texture.wrapT = wrapMode
  texture.repeat.set(repeatX, repeatY)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// 바닥 — RepeatWrapping (기본 타일 반복)
export function createFloorTexture(repeatX = 4, repeatY = 4) {
  return loadTexture(FLOOR_TEXTURE_PATH, THREE.RepeatWrapping, repeatX, repeatY)
}

// 벽 — MirroredRepeatWrapping (반복마다 좌우/상하로 뒤집힘). 벽마다 크기가 달라서
// repeatX/Y를 인자로 받아 타일 밀도(미터당 반복수)를 동일하게 맞춘다.
export function createWallTexture(repeatX = 4, repeatY = 2) {
  return loadTexture(WALL_TEXTURE_PATH, THREE.MirroredRepeatWrapping, repeatX, repeatY)
}

// 천장 — 벽과 동일한 MirroredRepeatWrapping
export function createCeilingTexture(repeatX = 4, repeatY = 4) {
  return loadTexture(WALL_TEXTURE_PATH, THREE.MirroredRepeatWrapping, repeatX, repeatY)
}
