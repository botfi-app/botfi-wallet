// mouse.js
import { onBeforeUnmount } from 'vue'

// by convention, composable function names start with "use"
export const useEventBus = () => {
    
    const eventsArr = []

    const emit = (event, data = {}) => {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    const on = (event, callback, removeOnUnmount = true) => {
        console.log(event)
        document.addEventListener(event, (e) => callback(e.detail));
        eventsArr.push({ name: event, callback, removeOnUnmount })
    }

    const off = (event, callback) => {
        document.removeEventListener(event, callback);
    }

    onBeforeUnmount(() => {
        eventsArr.forEach(async (item) => {
            if(item.removeOnUnmount)  document.removeEventListener(item.name, (()=>{}));
        })
    })

  return { emit, on, off }
}