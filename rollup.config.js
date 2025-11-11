import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.esm.js", format: "esm" },
    { file: "dist/index.cjs.js", format: "cjs" }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser()
  ],
  external: ["axios"]
};
