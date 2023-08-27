import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import AutoImport  from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import path from "path"
import viteCompression from 'vite-plugin-compression';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // i am ignorning my custom '<container>' tag
          isCustomElement: (tag) => ['lottie-player'].includes(tag)
        }
      }
    }),
    
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

    viteCompression({
      algorithm: ["brotliCompress"]
    })

  ],
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
  }

})
