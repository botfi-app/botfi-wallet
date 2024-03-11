import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SimpleBar from 'simplebar'
import 'simplebar/dist/simplebar.css';
import Bugsnag from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'
import VueLazyLoad from 'vue3-lazyload'
import { Buffer } from "buffer/"
import numberInput from './directives/numberInput'
import integerInput from './directives/integerInput'
import "./assets/scss/app.scss"
import App from './App.vue'
import router from "./router"
import appConfig from "./config/app"

const platforms = appConfig.platforms 
const pinia = createPinia()
const app = createApp(App)

window.Buffer = Buffer

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

app.use(pinia)
    .use(router)


const rmLoaderNShowContent = () => {
    window.setTimeout(() => {
    
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


/**
 * 
 * @param {*} platformPlugins {platformName: pluginInstance}
 * @returns 
 */
const startApp = (platformPlugins={}) => {

    const platforms = appConfig.platforms 
    let loc = window.location

    let platform = platforms[loc.hostname.toLowerCase()] || ""

    //console.log("platform===>", platform)

    if(!(platform in platformPlugins)){
        console.log(`Required Platform "${requiredPlatform}" does not match ${platform}`)
        if(loc.pathname != '/error/unknown-client'){
            window.location = "/error/unknown-client"
        }
        return true;
    }

    let _platformPlugin = platformPlugins[platform]

    app.use(_platformPlugin, { router })
        
    window.app_platform = platform

    document.body.classList.add(`platform-${platform}`)

    document.body.dataset.appLoaded=true

    // mount 
    app.mount('#app')
}

export  { app, startApp };
