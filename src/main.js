import { createApp } from 'vue'
import "./assets/scss/app.scss"
import App from './App.vue'
import 'bootstrap/js/src/modal'
import router from "./router"
import { createPinia } from 'pinia'
import telegram from './plugins/telegram'
import SimpleBar from 'simplebar'
import 'simplebar/dist/simplebar.css';
import LocomotiveScroll from 'locomotive-scroll';


const pinia = createPinia()

const app = createApp(App)

/*
document.addEventListener("touchmove", function (event) {
   // event.preventDefault();
}, { passive: false
});
*/

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
            .forEach(el => new SimpleBar(el));

    }, 200);
})


app.use(router)
    .use(pinia)
    .use(telegram, { router })
    
app.mount('#app')
