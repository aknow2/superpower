import {ArcRotateCamera, Color3, HemisphericLight, MeshBuilder, Scene, SpotLight, StandardMaterial, Vector3, PhysicsAggregate, PhysicsShapeType, HavokPlugin, PhysicsHelper, PhysicsUpdraftMode, Mesh } from '@babylonjs/core'
import HavokPhysics from "@babylonjs/havok";
import { Action, OnAction } from './predictor';

let boxes: Mesh[] = []
let physicsHelper: PhysicsHelper 
async function getInitializedHavok() {
  return await HavokPhysics();
}

const createRandomBoxs = (scene: Scene) => {
  const boxes = []
  for (let i = 0; i < 40; i++) {
    const box = MeshBuilder.CreateBox('box', { size: 0.5 }, scene)
    box.position.x = Math.random() * 10 - 5
    box.position.y = Math.random() * 10
    box.position.z = Math.random() * 10 - 5
    const mat = new StandardMaterial('boxMat'+i, scene)
    mat.diffuseColor = new Color3(Math.random(), Math.random(), Math.random())
    box.material = mat
    const aggrate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1, restitution: Math.random()}, scene)
    box.metadata = { aggrate }
    boxes.push(box)
  }
  return boxes
}

const prepareSceneSettings = async (scene: Scene) => {
    const  gravityVector = new Vector3(0, -9.81, 0);
    const hk = await getInitializedHavok();
    const PhysicsPlugin = new HavokPlugin(true, hk)
    scene.enablePhysics(gravityVector, PhysicsPlugin)
    physicsHelper = new PhysicsHelper(scene)

    // camera
    const camera = new ArcRotateCamera('camera', -Math.PI/2, Math.PI/2.4, 20, new Vector3(0, -0.1, 0));
    camera.setTarget(Vector3.Zero());
    scene.getEngine().getRenderingCanvas();

    // lighting
    const light = new HemisphericLight("light", new Vector3(0, 1, -1), scene);
    light.intensity = 0.4;
    const spot = new SpotLight("light", new Vector3(0, 10, 0), new Vector3(0,-1,0), Math.PI / 3, 2,scene);
    spot.intensity = 2
    spot.range = 15
    spot.diffuse = new Color3(1,1,1)

    // ground
    const groundMat = new StandardMaterial('groundMat', scene)
    groundMat.diffuseColor = new Color3(0.45, 0.3, 0.1)
    const ground = MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.position.y = -2
    ground.material = groundMat
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass:0 }, scene)
}

const createActionHandler = (scene: Scene) =>{
  const reset = () => {
    boxes.forEach(b => {
      const aggrate  = b.metadata.aggrate as PhysicsAggregate 
      aggrate.body.dispose()
      aggrate.dispose()
      b.dispose()
    })
    boxes = createRandomBoxs(scene)
  }

  // handle actions
  let currentEvent: any = undefined
  return (action: Action) => {

      if (currentEvent) {
        currentEvent.disable()
        currentEvent.dispose()
      }

      switch(action) {
        case 'updraft': {
          currentEvent = physicsHelper.updraft(new Vector3(0, 0, 1), 15, 2, 10, PhysicsUpdraftMode.Perpendicular)
          currentEvent.enable()
          break
        }
        case 'gravity': {
          currentEvent = physicsHelper.gravitationalField(new Vector3(0,0,0), 30, 30)
          currentEvent.enable()
          break
        }
        case 'explosion': {
            const ev = physicsHelper.applyRadialExplosionImpulse(new Vector3(0,0,0), 10, 10)
            setTimeout(() => {
              ev?.dispose()
            }, 1000)
            break
          }
        case 'vortex': {
          currentEvent = physicsHelper.vortex(new Vector3(0, -10, 0), 3, 40, 30)
          currentEvent.enable()
          break;
        }
        case 'reset':
           reset()
           break
        default:
          break
      }
    }
}


const initScene = async (scene: Scene, subscribeAction: (onAction: OnAction) => void) => {
  await prepareSceneSettings(scene)
  // boxes
  boxes = createRandomBoxs(scene)
  subscribeAction(createActionHandler(scene))
}

export default initScene
