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
import { visualizer } from "rollup-plugin-visualizer";
import dynamicImport from 'vite-plugin-dynamic-import'
import legacy from '@vitejs/plugin-legacy'
import { argv } from 'process'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { createHtmlPlugin } from 'vite-plugin-html'

//console.log("process.env.====>", process.env.BOTFI_PLATFORM)

const botfiPlatform = (process.env.BOTFI_PLATFORM || "").trim()
const env = process.env.NODE_ENV

console.log("Bot Platform==>", botfiPlatform)
console.log("process.env.NODE_ENV==>", env)

let htmlPuginData = { injectScript: "" }

const plugins = [
  vue(),

  dynamicImport(),
  VitePreload(),
  visualizer(),
  
  AutoImport(),
  
  legacy({ targets: ['defaults', 'not IE 11'] }),
  
  Pages({
    importMode: (botfiPlatform == 'capacitor') ? 'sync': 'async'
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

if (env == "production") {

  if(botfiPlatform != 'capacitor'){
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

  if(botfiPlatform == "telegram"){
    htmlPuginData = {
      injectScript: `<script src="https://telegram.org/js/telegram-web-app.js"></script>`,
    }
  }


} else {

  htmlPuginData = {
    injectScript: `<script src="https://telegram.org/js/telegram-web-app.js"></script>`,
  }

  plugins.push(...[
    basicSsl()
  ])
}

plugins.push(createHtmlPlugin({
  minify: false,
  entry: `src/main_${botfiPlatform}.js`,
  template: './index.html',
  inject: {
    data: htmlPuginData
  }

}));

export default defineConfig({
  //base: '/',
  rollupInputOptions: {
    input: path.resolve(__dirname, `/src/main_${botfiPlatform}.js`)
  },

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
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
            NodeGlobalsPolyfillPlugin({
                buffer: true
            })
        ]
    }
  },

  build: {
    polyfillDynamicImport: true,
    target: "es2015",
    
  },

  server: {
    host: '0.0.0.0',///'botfi-dev.com',
    port: 5173,
    strictPort: true, 
    //https: true,
    headers: {
      "localtonet-skip-warning": "true"
    }
  },

  define: {
    //"global": {},
  },
})
