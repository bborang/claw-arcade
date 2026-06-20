import * as THREE from 'three'

const CUBE_PATH = 'textures/skybox/'
const CUBE_FACES = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'] // +X,-X,+Y,-Y,+Z,-Z 순서

export function setupCubeEnvironment(scene) {
  const loader = new THREE.CubeTextureLoader()
  loader.setPath(`${import.meta.env.BASE_URL}${CUBE_PATH}`)

  const cubeTexture = loader.load(CUBE_FACES, undefined, undefined, (error) => {
    console.warn(`스카이박스 로드 실패: public/${CUBE_PATH} 안에 6장이 있는지 확인하세요.`, error)
  })

  scene.background = cubeTexture // 문 밖으로 보이는 배경
}
