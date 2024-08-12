import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
// 加载 .env 文件
dotenv.config();

export default {
  input: 'src/index.ts', // 你的入口文件
  output: {
    file: 'dist/telegram-sdk.js',
    format: 'iife', // 使用 IIFE 以便在浏览器中直接运行
    name: 'TelegramSDK', // 你的库名
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    replace({
      preventAssignment: true, // 避免意外替换过程中的赋值操作
      'process.env.API_BASE': JSON.stringify(process.env.API_BASE),
    }),
    commonjs(),
    json(),
    typescript(),
    polyfillNode(),
    terser(),
  ],
}
