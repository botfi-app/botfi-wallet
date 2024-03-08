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

   
const pinia = createPinia()
const app = createApp(App)
const platforms = appConfig.platforms 

window.Buffer = Buffer

app.use(pinia)
    .use(router)

// start the app 
const startApp = async () => {

    await loadPlatformPlugin()

    Bugsnag.start({
        apiKey:   appConfig.bugsnag_key,
        plugins:  [new BugsnagPluginVue()]
    })

    const bugsnagVue = Bugsnag.getPlugin('vue')


    BigInt.prototype["toJSON"] = function () {
        return this.toString();
    }

    router.beforeResolve(() => {
        let appDom = document.getElementById("app");
        let mainLoader = document.getElementById("main-loader");
        appDom.classList.add("hidden")
        mainLoader.classList.remove("hidden")
    })

    router.afterEach(() => rmLoaderNShowContent() )


    app.use(bugsnagVue)
        .use(VueLazyLoad)
        .directive("number", numberInput)
        .directive("integer", integerInput)


    app.mount('#app')
    
}

const rmLoaderNShowContent = () => {
    window.setTimeout(() => {

       // console.log("Hmmmmm----->>>>>", )
    
        let appDom = document.getElementById("app");
        let mainLoader = document.getElementById("main-loader");
        mainLoader.classList.add("hidden");
        appDom.classList.remove("hidden");

        [...document.querySelectorAll('[data-simplebar]')]
            .map(el => new SimpleBar(el));

        [...document.querySelectorAll('.dropdown-toggle')]
            .map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl))
    }, 100);
}

const loadPlatformPlugin = async () => {

    let loc = window.location

    //console.log("loc===>", loc)
    
    let platform = platforms[loc.hostname.toLowerCase()] || ""

    //console.log("platform===>", platform)

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
    } else if(platform == 'capacitor'){}

    let platformPlugin = (await import(`./plugins/${platform}`)).default

    //console.log("platformPlugin====>", platformPlugin)

    app.use(platformPlugin, { router })
    
    window.app_platform = platform

    document.body.classList.add(`platform-${platform}`)

    //console.log("platforms===>", platforms)
    //console.log("loc.hostname.toLowerCase()===>", loc.hostname.toLowerCase())
    //console.log("platformName===>", platform)

    rmLoaderNShowContent()

    document.body.dataset.appLoaded=true

    return true 
}


startApp()

