import { createApp } from 'vue'
import "./assets/scss/app.scss"
import App from './App.vue'
import router from "./router"
import { createPinia } from 'pinia'
import konsta from './plugins/konsta'
const pinia = createPinia()

const app = createApp(App)
    
app.use(router)
    .use(pinia)
    .use(konsta)
    
app.mount('#app')
