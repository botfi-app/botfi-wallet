import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import AutoImport  from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import path from "path"
//import viteCompression from 'vite-plugin-compression';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
//import nodePolyfills from 'vite-plugin-node-stdlib-browser'
//import ViteCompress from "vite-plugin-compress"
import ViteCompression2  from 'vite-plugin-compression2'
import zlib from "node:zlib"
import VitePreload from "vite-plugin-preload";
//import { VitePWA } from 'vite-plugin-pwa'
//import siteManisfest from "./public/site.webmanifest.json"
import { visualizer } from "rollup-plugin-visualizer";


const plugins = [
  vue(),

  VitePreload(),
  visualizer(),
  
  AutoImport(),

  Pages({
   importMode: 'async'
  }),

  Icons({ compiler: 'vue3' }),

  Components({
    directoryAsNamespace: false,
    dirs: ['src/components', 'src/layouts'],
    extensions: ['vue'],
    dts: true,
    include: [/\.vue$/, /\.vue\?vue/],
    resolvers: [IconsResolver({  prefix: 'ic' })],
  }),
]

if (process.env.NODE_ENV === "production") {
  plugins.push(...[
      ViteCompression2({
        include: /(\.(html|css|jsx?|ts|json|txt|woff|tff|woff2|otf))$/i,
        algorithm: 'brotliCompress',
        threshold: 1000,
        compressionOptions: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
        filename: "[path][base].br"
      })
    ]
  )
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.join(__dirname, '/src/'),
      '~': __dirname+"/node_modules/",
    },
  },

  optimizeDeps: {
    exclude: [
      "whatwg-fetch",
      "animate.css"
    ],
  },

  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true, 
    headers: {
    
    }
  }

})
