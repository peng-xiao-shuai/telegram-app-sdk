import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import polyfillNode from 'rollup-plugin-polyfill-node'

export default {
  input: 'src/index.ts', // 你的入口文件
  output: {
    file: 'dist/bundle.js',
    format: 'iife', // 使用 IIFE 以便在浏览器中直接运行
    name: 'TelegramSDK', // 你的库名
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    typescript(),
    polyfillNode(),
    // terser(), // 可选，压缩输出文件
  ],
}
