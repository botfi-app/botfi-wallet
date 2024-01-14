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
import { VitePWA } from 'vite-plugin-pwa'
import siteManisfest from "./public/site.webmanifest.js"
import { visualizer } from "rollup-plugin-visualizer";
import dynamicImport from 'vite-plugin-dynamic-import'
import legacy from '@vitejs/plugin-legacy'
//import basicSsl from '@vitejs/plugin-basic-ssl'



const plugins = [
  vue(),

  dynamicImport(),
  VitePreload(),
  visualizer(),
  
  AutoImport(),

  VitePWA({
    manifest: siteManisfest,
    registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
  }),
  
  legacy({ targets: ['defaults', 'not IE 11'] }),
  
  Pages({
    importMode(filepath, options) {
      //console.log("filePath===>", filepath)
      
      let routesArr = [
        "/src/pages/index.vue",
        "/src/pages/wallet/index.vue",
        "/src/pages/settings/index.vue"
      ]

      return (routesArr.includes(filepath))
            ? "sync"
            : "async"
    }

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
} else {
  plugins.push(...[
    ///basicSsl()
  ])
}

export default defineConfig({
  //base: '/',

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
    /*esbuildOptions: {
      target: "esnext", 
      supported: { 
        bigint: true 
      },
    }*/
  },

  build: {
    polyfillDynamicImport: true,
    target: "es2015"
  },

  server: {
    host: 'botfi-dev.com',
    port: 5173,
    strictPort: true, 
    //https: true,
    headers: {
      "localtonet-skip-warning": "true"
    }
  }

})
