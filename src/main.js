import { createApp } from 'vue'
import { createPinia } from 'pinia'
import telegram from './plugins/telegram'
import SimpleBar from 'simplebar'
import 'simplebar/dist/simplebar.css';
import '@dotlottie/player-component';
import Bugsnag from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'
import appConfig from "./config/app"
import VueLazyLoad from 'vue3-lazyload'
import { Buffer } from "buffer/"
import numberInput from './directives/numberInput'
import integerInput from './directives/integerInput'
import "./assets/scss/app.scss"
import App from './App.vue'
import router from "./router"


window.Buffer = Buffer

// very important
const pinia = createPinia()

Bugsnag.start({
  apiKey:   appConfig.bugsnag_key,
  plugins:  [new BugsnagPluginVue()]
})

const bugsnagVue = Bugsnag.getPlugin('vue')


const app = createApp(App)

BigInt.prototype["toJSON"] = function () {
    return this.toString();
}

router.beforeResolve(() => {
    const appDom = document.querySelector("#app")
    const mainLoader = document.querySelector("#main-loader")
    appDom.classList.add("hidden")
    mainLoader.classList.remove("hidden")
})

router.afterEach(() => {
    window.setTimeout(() => {
     
        let appDom = document.getElementById("app");
        let mainLoader = document.getElementById("main-loader");
        mainLoader.classList.add("hidden");
        appDom.classList.remove("hidden");

        [...document.querySelectorAll('[data-simplebar]')]
            .map(el => new SimpleBar(el));

        [...document.querySelectorAll('.dropdown-toggle')]
            .map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl))
    }, 200);
})


app 
 .use(bugsnagVue)
 .use(router)
 .use(pinia)
 .use(telegram, { router })
 .use(VueLazyLoad)
 .directive("number", numberInput)
 .directive("integer", integerInput)
    
app.mount('#app')
