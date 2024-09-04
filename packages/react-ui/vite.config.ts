import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist', // 确保输出目录为 dist
      entryRoot: 'src', // 确保入口根目录为 src
      tsconfigPath: path.resolve(__dirname, 'tsconfig.node.json'), // 指定 tsconfig 文件路径
      rollupTypes: true,
      bundledPackages: ['@telegram-sdk/ts-core'],
    }),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envDir: path.resolve(__dirname, '../../'),
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
  },
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TG_SDK_UI',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) =>
        format === 'iife' ? 'telegram-sdk-ui.js' : `index.${format}.js`,
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
