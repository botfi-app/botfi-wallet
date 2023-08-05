import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.afterEach((to, from) => {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

export default router;