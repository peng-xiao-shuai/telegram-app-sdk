import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

// 加载 .env 文件
dotenv.config();

const production = !process.env.ROLLUP_WATCH

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
    !production && serve({
      contentBase: ['dist'],
      open: true,
      host: 'localhost',
      port: 4000,
    }),
    !production && livereload('dist'),
    production && terser(),
  ],
  watch: {
    clearScreen: false
  }
}
