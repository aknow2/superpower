declare module '@babylonjs/havok' {
  import { PhysicsEngine, PhysicsImpostor } from '@babylonjs/core';
  export class HavokPhysicsEngine extends PhysicsEngine {}
  export class HavokPhysicsImpostor extends PhysicsImpostor {}
  
  export default function(): any {
    return 
  }
}

declare namespace globalThis {
  export const tmPose: any
}
