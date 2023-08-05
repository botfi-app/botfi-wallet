// mouse.js
import { onBeforeUnmount } from 'vue'
import { useEventBus } from './useEventBus'

const eventBus = useEventBus()

// by convention, composable function names start with "use"
export const useAlertDialog = () => {

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
    