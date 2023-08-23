import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import Settings from './classes/Settings'
import Utils from './classes/Utils'

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeResolve( async (to) => {

    let settingsStatus = await Settings.fetchDefaultSettings()

    if(settingsStatus.isError()){
        Utils.mAlert(settingsStatus.getMessage())
        return false
    }

    return true
})

router.afterEach((to, from) => {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

export default router;