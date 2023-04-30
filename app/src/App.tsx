import './App.css'
import { Scene } from '@babylonjs/core'
import SceneComponent from 'babylonjs-hook';
import useForcePreditor from './predictor';
import initScene from './scene';

function App() {
  const { init, addListeners } = useForcePreditor()

  const onSceneReady = async (scene: Scene) => {
    await initScene(scene, addListeners)
  }

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <SceneComponent id="canvas" onSceneReady={onSceneReady} ></SceneComponent>
        <div style={{fontSize: 24, width: '100%', position: 'absolute', top: 0, display: 'flex', justifyContent: 'space-between', padding: 16 }}>
          <button onClick={init}>
            SUPERPOWER!
          </button>
        </div>
        <canvas id={"videoCanvas"} style={{ position: 'absolute', right: 16, top: 16 }} width={200} height={200}></canvas>
      </div>
    </>
  )
}

export default App
