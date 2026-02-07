export {};

declare module '*.glb' {
  const url: string;
  export default url;
}

declare module 'meshline' {
  export const MeshLineGeometry: unknown;
  export const MeshLineMaterial: unknown;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Record<string, unknown>;
      meshLineMaterial: Record<string, unknown>;
    }
  }
}
