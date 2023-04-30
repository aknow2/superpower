export interface Prediction {
  className: 'reset' | 'updraft' | 'explosion' | 'vortex' | 'gravity' | 'idle'
  probability: number
}

export type Action = Prediction['className']
let model: any,  webcam: any;
const URL = "./model/";

let currentAction: Action = 'idle'
let detectCount = 0
let ctx: CanvasRenderingContext2D
export type OnAction = (action: Action) => void
const listeners: OnAction[] = []

const useForcePreditor = () => {

  const addListeners = (onAction: OnAction) => {
    listeners.push(onAction)
  }

  async function init() {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmPose.load(modelURL, metadataURL);
      const size = 200;
      const flip = true; 
      webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
      await webcam.setup(); // request access to the webcam
      await webcam.play();
      webcam.canvas.width = size;
      webcam.canvas.height = size;
      window.requestAnimationFrame(loop);

      const elm = document.getElementById('videoCanvas') as HTMLCanvasElement
      ctx = elm.getContext('2d') as CanvasRenderingContext2D
  }
  async function predict() {
      const { posenetOutput } = await model.estimatePose(webcam.canvas);
      const predictions: Prediction[] = await model.predict(posenetOutput);

      const action: Action = predictions.reduce((action, p) => {
        if (p.probability > 0.97) {
          console.log(p.className)
          return p.className
        }
        return action
      }, 'idle' as Prediction['className']) 

      console.log(currentAction, action)
      if (currentAction !== action) {
        detectCount++

        if (detectCount > 5) {
          detectCount = 0
          currentAction = action
          listeners.forEach(l => l(currentAction))
        }
      } else {
        detectCount = 0
      }
  }

  async function loop() {
      webcam.update(); // update the webcam frame
      await predict();
      ctx.drawImage(webcam.canvas, 0, 0);
      window.requestAnimationFrame(loop);
  }


  return {
    addListeners,
    init,
  }
}

export default useForcePreditor
