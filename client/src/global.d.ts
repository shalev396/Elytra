export {};

declare module "*.glb" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "meshline" {
  export const MeshLineGeometry: unknown;
  export const MeshLineMaterial: unknown;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Record<string, unknown>;
      meshLineMaterial: Record<string, unknown>;
    }
  }
}
