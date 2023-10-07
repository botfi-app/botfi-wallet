import { createApp } from 'vue'
import "./assets/scss/app.scss"
import App from './App.vue'
import router from "./router"
import { createPinia } from 'pinia'
import telegram from './plugins/telegram'
import SimpleBar from 'simplebar'
import 'simplebar/dist/simplebar.css';
//simport { Dropdown } from 'bootstrap'
import '@dotlottie/player-component';
const pinia = createPinia()
import Bugsnag from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'
import appConfig from "./config/app"

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


app.use(bugsnagVue)
    .use(router)
    .use(pinia)
    .use(telegram, { router })
    
app.mount('#app')
