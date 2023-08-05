import { useEventBus } from './useEventBus'


// by convention, composable function names start with "use"
export const useToast = () => {

    const eventBus = useEventBus()


    const open = (text, autoclose=true) => {
        eventBus.emit("open-toast", { text, autoclose })
    }

    const close = () => {
        eventBus.emit("close-toast")
    }

    return { open, close }
}
    