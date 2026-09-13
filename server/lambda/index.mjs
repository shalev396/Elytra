// Function asset: a Lambda handler must live in the function's own code, not in a layer.
// Everything real is in the codebase layer (/opt/nodejs/app), with packages resolved from the
// dependencies layer (/opt/nodejs/node_modules). Keep this file one line of code.
export { handler } from '/opt/nodejs/app/index.mjs';
