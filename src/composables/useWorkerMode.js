import { useWebWorkerFn } from '@vueuse/core'

export const useWorkerMode = () => {

    const run = async (funcName) => {
        const { workerFn } = useWebWorkerFn(() => {
            callback()
        })
    }
}