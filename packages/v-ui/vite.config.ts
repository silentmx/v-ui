import Vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "v-ui",
      fileName: "v-ui",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          "vue": "Vue",
          "@floating-ui/vue": "FloatingVue",
        }
      }
    }
  },
  plugins: [
    Vue(),
    Unocss(),
    AutoImport({
      imports: ["vue", "@vueuse/core"],
      dts: "src/auto-imports.d.ts",
      ignore: ["h"],
      vueTemplate: true
    }),
  ]
});