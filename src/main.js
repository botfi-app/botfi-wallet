import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SimpleBar from 'simplebar'
import 'simplebar/dist/simplebar.css';
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
//import RouterPrefetch from 'vue-router-prefetch'


const platforms = appConfig.platforms 

window.Buffer = Buffer

// very important
const pinia = createPinia()

Bugsnag.start({
  apiKey:   appConfig.bugsnag_key,
  plugins:  [new BugsnagPluginVue()]
})

const bugsnagVue = Bugsnag.getPlugin('vue')


BigInt.prototype["toJSON"] = function () {
    return this.toString();
}

// start the app 
const startApp = async () => {

    const app = createApp(App)

    router.beforeResolve(() => {
        let appDom = document.getElementById("app");
        let mainLoader = document.getElementById("main-loader");
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

    await loadPlatformPlugin(app)

    app 
    .use(bugsnagVue)
    .use(router)
    //.use(RouterPrefetch)
    .use(pinia)
    .use(VueLazyLoad)
    .directive("number", numberInput)
    .directive("integer", integerInput)

    

    app.mount('#app')
}

const loadPlatformPlugin = async (app) => {

    let loc = window.location

    console.log("loc===>", loc)
    
    let platform = platforms[loc.hostname.toLowerCase()] || ""

    if(platform == ""){
        if(loc.pathname != '/error/unknown-client'){
            window.location = "/error/unknown-client"
        }
        return false;
    } 

    if(platform == 'telegram'){
        let s = document.createElement('script')
        s.src = 'https://telegram.org/js/telegram-web-app.js'
        document.head.appendChild(s)
    } else if(platform == 'capacitor'){
      
    }

    let platformPlugin = (await import(`./plugins/${platform}`)).default

    console.log("platformPlugin====>", platformPlugin)

    app.use(platformPlugin, { router })
    
    window.app_platform = platform

    console.log("platforms===>", platforms)
    console.log("loc.hostname.toLowerCase()===>", loc.hostname.toLowerCase())
    console.log("platformName===>", platform)

    return true 
}


startApp()


