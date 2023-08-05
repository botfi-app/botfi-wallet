// mouse.js
import { onBeforeUnmount } from 'vue'
import { useEventBus } from './useEventBus'


// by convention, composable function names start with "use"
export const useAlertDialog = () => {

    const eventBus = useEventBus()

    const open = (title, message) => {
        eventBus.emit("open-dialog", {title, message})
    }

    const close = (title, message) => {
        eventBus.emit("close-dialog")
    }

    const update = (title, message) => {
        eventBus.emit("close-dialog", {title, message})
    }

    return { open, close, update }
}
    