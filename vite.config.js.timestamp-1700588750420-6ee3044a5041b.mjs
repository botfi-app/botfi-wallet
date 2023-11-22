// vite.config.js
import { defineConfig } from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite/dist/node/index.js";
import vue from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Pages from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-pages/dist/index.mjs";
import AutoImport from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-vue-components/dist/vite.mjs";
import path from "path";
import viteCompression from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-compression/dist/index.mjs";
import Icons from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-icons/dist/vite.mjs";
import IconsResolver from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-icons/dist/resolver.mjs";
var __vite_injected_original_dirname = "/Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet";
var vite_config_default = defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // i am ignorning my custom '<container>' tag
          isCustomElement: (tag) => ["dotlottie-player"].includes(tag)
        }
      }
    }),
    //nodePolyfills(),
    AutoImport(),
    Pages({
      importMode: "async"
    }),
    Icons({ compiler: "vue3" }),
    Components({
      directoryAsNamespace: false,
      dirs: ["src/components", "src/layouts"],
      extensions: ["vue"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [IconsResolver({ prefix: "ic" })]
    }),
    viteCompression({
      algorithm: ["brotliCompress"]
    })
  ],
  resolve: {
    alias: {
      "@": path.join(__vite_injected_original_dirname, "/src/"),
      "~": __vite_injected_original_dirname + "/node_modules/"
    }
  },
  optimizeDeps: {
    exclude: [
      "whatwg-fetch",
      "animate.css",
      "@dotlottie/player-component",
      "vue3-popper"
    ]
  },
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    headers: {}
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9TdWNjZXNzTGFiL2RyaXZlL1Byb2plY3RzL0RhcHBzL2JvdGZpL2JvdGZpLXdhbGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvU3VjY2Vzc0xhYi9kcml2ZS9Qcm9qZWN0cy9EYXBwcy9ib3RmaS9ib3RmaS13YWxsZXQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvU3VjY2Vzc0xhYi9kcml2ZS9Qcm9qZWN0cy9EYXBwcy9ib3RmaS9ib3RmaS13YWxsZXQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgUGFnZXMgZnJvbSAndml0ZS1wbHVnaW4tcGFnZXMnXG5pbXBvcnQgQXV0b0ltcG9ydCAgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJztcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJ1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXG4vL2ltcG9ydCBub2RlUG9seWZpbGxzIGZyb20gJ3ZpdGUtcGx1Z2luLW5vZGUtc3RkbGliLWJyb3dzZXInXG5cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoe1xuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgLy8gaSBhbSBpZ25vcm5pbmcgbXkgY3VzdG9tICc8Y29udGFpbmVyPicgdGFnXG4gICAgICAgICAgaXNDdXN0b21FbGVtZW50OiAodGFnKSA9PiBbJ2RvdGxvdHRpZS1wbGF5ZXInXS5pbmNsdWRlcyh0YWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcbiAgICBcbiAgICAvL25vZGVQb2x5ZmlsbHMoKSxcblxuICAgIEF1dG9JbXBvcnQoKSxcblxuICAgIFBhZ2VzKHtcbiAgICAgIGltcG9ydE1vZGU6ICdhc3luYydcbiAgICB9KSxcblxuICAgIEljb25zKHsgY29tcGlsZXI6ICd2dWUzJyB9KSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGRpcmVjdG9yeUFzTmFtZXNwYWNlOiBmYWxzZSxcbiAgICAgIGRpcnM6IFsnc3JjL2NvbXBvbmVudHMnLCAnc3JjL2xheW91dHMnXSxcbiAgICAgIGV4dGVuc2lvbnM6IFsndnVlJ10sXG4gICAgICBkdHM6IHRydWUsXG4gICAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudnVlXFw/dnVlL10sXG4gICAgICByZXNvbHZlcnM6IFtJY29uc1Jlc29sdmVyKHsgIHByZWZpeDogJ2ljJyB9KV0sXG4gICAgfSksXG5cbiAgICB2aXRlQ29tcHJlc3Npb24oe1xuICAgICAgYWxnb3JpdGhtOiBbXCJicm90bGlDb21wcmVzc1wiXVxuICAgIH0pXG5cbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICcvc3JjLycpLFxuICAgICAgJ34nOiBfX2Rpcm5hbWUrXCIvbm9kZV9tb2R1bGVzL1wiLFxuICAgIH0sXG4gIH0sXG5cbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogW1xuICAgICAgXCJ3aGF0d2ctZmV0Y2hcIixcbiAgICAgIFwiYW5pbWF0ZS5jc3NcIixcbiAgICAgIFwiQGRvdGxvdHRpZS9wbGF5ZXItY29tcG9uZW50XCIsXG4gICAgICBcInZ1ZTMtcG9wcGVyXCJcbiAgICBdLFxuICB9LFxuXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSwgXG4gICAgaGVhZGVyczoge1xuICAgIFxuICAgIH1cbiAgfVxuXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLG9CQUFvQjtBQUNoWSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZ0JBQWlCO0FBQ3hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sVUFBVTtBQUNqQixPQUFPLHFCQUFxQjtBQUM1QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFSMUIsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsVUFBVTtBQUFBLFFBQ1IsaUJBQWlCO0FBQUE7QUFBQSxVQUVmLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEdBQUc7QUFBQSxRQUM3RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBLElBSUQsV0FBVztBQUFBLElBRVgsTUFBTTtBQUFBLE1BQ0osWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLElBRUQsTUFBTSxFQUFFLFVBQVUsT0FBTyxDQUFDO0FBQUEsSUFDMUIsV0FBVztBQUFBLE1BQ1Qsc0JBQXNCO0FBQUEsTUFDdEIsTUFBTSxDQUFDLGtCQUFrQixhQUFhO0FBQUEsTUFDdEMsWUFBWSxDQUFDLEtBQUs7QUFBQSxNQUNsQixLQUFLO0FBQUEsTUFDTCxTQUFTLENBQUMsVUFBVSxZQUFZO0FBQUEsTUFDaEMsV0FBVyxDQUFDLGNBQWMsRUFBRyxRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQUEsSUFDOUMsQ0FBQztBQUFBLElBRUQsZ0JBQWdCO0FBQUEsTUFDZCxXQUFXLENBQUMsZ0JBQWdCO0FBQUEsSUFDOUIsQ0FBQztBQUFBLEVBRUg7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxLQUFLLGtDQUFXLE9BQU87QUFBQSxNQUNqQyxLQUFLLG1DQUFVO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixTQUFTLENBRVQ7QUFBQSxFQUNGO0FBRUYsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
