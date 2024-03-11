// vite.config.js
import { defineConfig } from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite/dist/node/index.js";
import vue from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Pages from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-pages/dist/index.mjs";
import AutoImport from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-vue-components/dist/vite.mjs";
import path from "path";
import Icons from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-icons/dist/vite.mjs";
import IconsResolver from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/unplugin-icons/dist/resolver.mjs";
import ViteCompression2 from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-compression2/dist/index.mjs";
import zlib from "node:zlib";
import VitePreload from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-preload/dist/index.mjs";
import { visualizer } from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import dynamicImport from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-dynamic-import/dist/index.mjs";
import legacy from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import basicSsl from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
import { NodeGlobalsPolyfillPlugin } from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { createHtmlPlugin } from "file:///Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet/node_modules/vite-plugin-html/dist/index.mjs";
var __vite_injected_original_dirname = "/Volumes/SuccessLab/drive/Projects/Dapps/botfi/botfi-wallet";
var botfiPlatform = (process.env.BOTFI_PLATFORM || "").trim();
var env = process.env.NODE_ENV;
console.log("Bot Platform==>", botfiPlatform);
console.log("process.env.NODE_ENV==>", env);
var htmlPuginData = { injectScript: "" };
var plugins = [
  vue(),
  dynamicImport(),
  VitePreload(),
  visualizer(),
  AutoImport(),
  legacy({ targets: ["defaults", "not IE 11"] }),
  Pages({
    importMode: botfiPlatform == "capacitor" ? "sync" : "async"
  }),
  Icons({ compiler: "vue3" }),
  Components({
    directoryAsNamespace: false,
    dirs: ["src/components", "src/layouts"],
    extensions: ["vue"],
    dts: true,
    include: [/\.vue$/, /\.vue\?vue/],
    resolvers: [IconsResolver({ prefix: "ic" })]
  })
];
if (env == "production") {
  if (botfiPlatform != "capacitor") {
    plugins.push(
      ...[
        ViteCompression2({
          include: /(\.(html|css|jsx?|ts|json|txt|woff|tff|woff2|otf))$/i,
          algorithm: "brotliCompress",
          threshold: 1e3,
          compressionOptions: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11
          },
          filename: "[path][base].br"
        })
      ]
    );
  }
  if (botfiPlatform == "telegram") {
    console.log("HHHHHMMMMMMM======>>>>>>");
    process.exit();
    htmlPuginData = {
      injectScript: `<script src="https://telegram.org/js/telegram-web-app.js"></script>`
    };
  }
} else {
  htmlPuginData = {
    injectScript: `<script src="https://telegram.org/js/telegram-web-app.js"></script>`
  };
  plugins.push(...[
    basicSsl()
  ]);
}
plugins.push(createHtmlPlugin({
  minify: false,
  entry: `src/main_${botfiPlatform}.js`,
  template: "./index.html",
  inject: {
    data: htmlPuginData
  }
}));
var vite_config_default = defineConfig({
  //base: '/',
  rollupInputOptions: {
    input: path.resolve(__vite_injected_original_dirname, `/src/main_${botfiPlatform}.js`)
  },
  plugins,
  resolve: {
    alias: {
      "@": path.join(__vite_injected_original_dirname, "/src/"),
      "~": __vite_injected_original_dirname + "/node_modules/"
    }
  },
  optimizeDeps: {
    exclude: [
      "whatwg-fetch",
      "animate.css"
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis"
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
    target: "es2015"
  },
  server: {
    host: "0.0.0.0",
    ///'botfi-dev.com',
    port: 5173,
    strictPort: true,
    //https: true,
    headers: {
      "localtonet-skip-warning": "true"
    }
  },
  define: {
    //"global": {},
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9TdWNjZXNzTGFiL2RyaXZlL1Byb2plY3RzL0RhcHBzL2JvdGZpL2JvdGZpLXdhbGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvU3VjY2Vzc0xhYi9kcml2ZS9Qcm9qZWN0cy9EYXBwcy9ib3RmaS9ib3RmaS13YWxsZXQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvU3VjY2Vzc0xhYi9kcml2ZS9Qcm9qZWN0cy9EYXBwcy9ib3RmaS9ib3RmaS13YWxsZXQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgUGFnZXMgZnJvbSAndml0ZS1wbHVnaW4tcGFnZXMnXG5pbXBvcnQgQXV0b0ltcG9ydCAgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiXG4vL2ltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nO1xuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXG5pbXBvcnQgSWNvbnNSZXNvbHZlciBmcm9tICd1bnBsdWdpbi1pY29ucy9yZXNvbHZlcidcbi8vaW1wb3J0IG5vZGVQb2x5ZmlsbHMgZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1zdGRsaWItYnJvd3Nlcidcbi8vaW1wb3J0IFZpdGVDb21wcmVzcyBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3NcIlxuaW1wb3J0IFZpdGVDb21wcmVzc2lvbjIgIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uMidcbmltcG9ydCB6bGliIGZyb20gXCJub2RlOnpsaWJcIlxuaW1wb3J0IFZpdGVQcmVsb2FkIGZyb20gXCJ2aXRlLXBsdWdpbi1wcmVsb2FkXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IGR5bmFtaWNJbXBvcnQgZnJvbSAndml0ZS1wbHVnaW4tZHluYW1pYy1pbXBvcnQnXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCB7IGFyZ3YgfSBmcm9tICdwcm9jZXNzJ1xuaW1wb3J0IGJhc2ljU3NsIGZyb20gJ0B2aXRlanMvcGx1Z2luLWJhc2ljLXNzbCdcbmltcG9ydCB7IE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4gfSBmcm9tICdAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbCdcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJ1xuXG4vL2NvbnNvbGUubG9nKFwicHJvY2Vzcy5lbnYuPT09PT5cIiwgcHJvY2Vzcy5lbnYuQk9URklfUExBVEZPUk0pXG5cbmNvbnN0IGJvdGZpUGxhdGZvcm0gPSAocHJvY2Vzcy5lbnYuQk9URklfUExBVEZPUk0gfHwgXCJcIikudHJpbSgpXG5jb25zdCBlbnYgPSBwcm9jZXNzLmVudi5OT0RFX0VOVlxuXG5jb25zb2xlLmxvZyhcIkJvdCBQbGF0Zm9ybT09PlwiLCBib3RmaVBsYXRmb3JtKVxuY29uc29sZS5sb2coXCJwcm9jZXNzLmVudi5OT0RFX0VOVj09PlwiLCBlbnYpXG5cbmxldCBodG1sUHVnaW5EYXRhID0geyBpbmplY3RTY3JpcHQ6IFwiXCIgfVxuXG5jb25zdCBwbHVnaW5zID0gW1xuICB2dWUoKSxcblxuICBkeW5hbWljSW1wb3J0KCksXG4gIFZpdGVQcmVsb2FkKCksXG4gIHZpc3VhbGl6ZXIoKSxcbiAgXG4gIEF1dG9JbXBvcnQoKSxcbiAgXG4gIGxlZ2FjeSh7IHRhcmdldHM6IFsnZGVmYXVsdHMnLCAnbm90IElFIDExJ10gfSksXG4gIFxuICBQYWdlcyh7XG4gICAgaW1wb3J0TW9kZTogKGJvdGZpUGxhdGZvcm0gPT0gJ2NhcGFjaXRvcicpID8gJ3N5bmMnOiAnYXN5bmMnXG4gIH0pLFxuXG4gIEljb25zKHsgY29tcGlsZXI6ICd2dWUzJyB9KSxcblxuICBDb21wb25lbnRzKHtcbiAgICBkaXJlY3RvcnlBc05hbWVzcGFjZTogZmFsc2UsXG4gICAgZGlyczogWydzcmMvY29tcG9uZW50cycsICdzcmMvbGF5b3V0cyddLFxuICAgIGV4dGVuc2lvbnM6IFsndnVlJ10sXG4gICAgZHRzOiB0cnVlLFxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvXSxcbiAgICByZXNvbHZlcnM6IFtJY29uc1Jlc29sdmVyKHsgIHByZWZpeDogJ2ljJyB9KV0sXG4gIH0pLFxuXVxuXG5pZiAoZW52ID09IFwicHJvZHVjdGlvblwiKSB7XG5cbiAgaWYoYm90ZmlQbGF0Zm9ybSAhPSAnY2FwYWNpdG9yJyl7XG4gICAgcGx1Z2lucy5wdXNoKC4uLltcbiAgICAgICAgVml0ZUNvbXByZXNzaW9uMih7XG4gICAgICAgICAgaW5jbHVkZTogLyhcXC4oaHRtbHxjc3N8anN4P3x0c3xqc29ufHR4dHx3b2ZmfHRmZnx3b2ZmMnxvdGYpKSQvaSxcbiAgICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXG4gICAgICAgICAgdGhyZXNob2xkOiAxMDAwLFxuICAgICAgICAgIGNvbXByZXNzaW9uT3B0aW9uczoge1xuICAgICAgICAgICAgW3psaWIuY29uc3RhbnRzLkJST1RMSV9QQVJBTV9RVUFMSVRZXTogMTEsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBmaWxlbmFtZTogXCJbcGF0aF1bYmFzZV0uYnJcIlxuICAgICAgICB9KVxuICAgICAgXVxuICAgIClcbiAgfSBcblxuICBpZihib3RmaVBsYXRmb3JtID09IFwidGVsZWdyYW1cIil7XG4gICAgY29uc29sZS5sb2coXCJISEhISE1NTU1NTU09PT09PT0+Pj4+Pj5cIilcbiAgICBwcm9jZXNzLmV4aXQoKVxuICAgIGh0bWxQdWdpbkRhdGEgPSB7XG4gICAgICBpbmplY3RTY3JpcHQ6IGA8c2NyaXB0IHNyYz1cImh0dHBzOi8vdGVsZWdyYW0ub3JnL2pzL3RlbGVncmFtLXdlYi1hcHAuanNcIj48L3NjcmlwdD5gLFxuICAgIH1cbiAgfVxuXG5cbn0gZWxzZSB7XG5cbiAgaHRtbFB1Z2luRGF0YSA9IHtcbiAgICBpbmplY3RTY3JpcHQ6IGA8c2NyaXB0IHNyYz1cImh0dHBzOi8vdGVsZWdyYW0ub3JnL2pzL3RlbGVncmFtLXdlYi1hcHAuanNcIj48L3NjcmlwdD5gLFxuICB9XG5cbiAgcGx1Z2lucy5wdXNoKC4uLltcbiAgICBiYXNpY1NzbCgpXG4gIF0pXG59XG5cbnBsdWdpbnMucHVzaChjcmVhdGVIdG1sUGx1Z2luKHtcbiAgbWluaWZ5OiBmYWxzZSxcbiAgZW50cnk6IGBzcmMvbWFpbl8ke2JvdGZpUGxhdGZvcm19LmpzYCxcbiAgdGVtcGxhdGU6ICcuL2luZGV4Lmh0bWwnLFxuICBpbmplY3Q6IHtcbiAgICBkYXRhOiBodG1sUHVnaW5EYXRhXG4gIH1cblxufSkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvL2Jhc2U6ICcvJyxcbiAgcm9sbHVwSW5wdXRPcHRpb25zOiB7XG4gICAgaW5wdXQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAvc3JjL21haW5fJHtib3RmaVBsYXRmb3JtfS5qc2ApXG4gIH0sXG5cbiAgcGx1Z2lucyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICcvc3JjLycpLFxuICAgICAgJ34nOiBfX2Rpcm5hbWUrXCIvbm9kZV9tb2R1bGVzL1wiLFxuICAgIH0sXG4gIH0sXG5cbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogW1xuICAgICAgXCJ3aGF0d2ctZmV0Y2hcIixcbiAgICAgIFwiYW5pbWF0ZS5jc3NcIlxuICAgIF0sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgLy8gTm9kZS5qcyBnbG9iYWwgdG8gYnJvd3NlciBnbG9iYWxUaGlzXG4gICAgICAgIGRlZmluZToge1xuICAgICAgICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcydcbiAgICAgICAgfSxcbiAgICAgICAgLy8gRW5hYmxlIGVzYnVpbGQgcG9seWZpbGwgcGx1Z2luc1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luKHtcbiAgICAgICAgICAgICAgICBidWZmZXI6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICB9XG4gIH0sXG5cbiAgYnVpbGQ6IHtcbiAgICBwb2x5ZmlsbER5bmFtaWNJbXBvcnQ6IHRydWUsXG4gICAgdGFyZ2V0OiBcImVzMjAxNVwiLFxuICAgIFxuICB9LFxuXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICcwLjAuMC4wJywvLy8nYm90ZmktZGV2LmNvbScsXG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLCBcbiAgICAvL2h0dHBzOiB0cnVlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwibG9jYWx0b25ldC1za2lwLXdhcm5pbmdcIjogXCJ0cnVlXCJcbiAgICB9XG4gIH0sXG5cbiAgZGVmaW5lOiB7XG4gICAgLy9cImdsb2JhbFwiOiB7fSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1XLFNBQVMsb0JBQW9CO0FBQ2hZLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxnQkFBaUI7QUFDeEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxVQUFVO0FBRWpCLE9B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
