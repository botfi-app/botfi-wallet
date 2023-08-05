/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

export default class EventBus{

    static emit(event, data = {}){
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    static on(event, callback) {
        document.addEventListener(event, (e) => callback(e.detail));
    }

    static off(event, callback) {
        document.removeEventListener(event, callback);
    }
}
