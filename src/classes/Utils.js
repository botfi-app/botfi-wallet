/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { useRoute,  useRouter } from "vue-router";
import Swal from 'sweetalert2'
import "sweetalert2/src/sweetalert2.scss"
import EventBus from './EventBus'

const $swal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: 'flex text-center justify-center items-center appearance-none py-1 transition-colors focus:outline-none cursor-pointer select-none overflow-hidden z-10 inline-flex relative duration-300 font-medium px-4 rounded-full active:bg-opacity-15 touch-ripple-primary text-md-light-primary dark:text-md-dark-primary text-sm h-10',
        cancelButton: 'flex text-center justify-center items-center appearance-none py-1 transition-colors focus:outline-none cursor-pointer select-none overflow-hidden z-10 inline-flex relative duration-300 font-medium px-4 rounded-full active:bg-opacity-15 touch-ripple-primary text-md-light-primary dark:text-md-dark-primary text-sm h-10',
        popup: 'rounded-[1.75rem]  max-w-[90%] w-[19.5rem] bg-md-light-surface-3 dark:bg-md-dark-surface-3',
        title: "w-full text-md-light-on-surface dark:text-md-dark-on-surface",
        htmlContainer: "text-md-light-on-surface-variant dark:text-md-dark-on-surface-variant",
        footer: 'flex items-center justify-end pt-6 space-x-2 rtl:space-x-reverse'
    },
})


export default class Utils {

    static logError(msg, err){
        console.log(msg, err)
    }

    static getSwal() {
        return $swal
    }

    static mAlert(text) {

        let html = `<div class="mt-4">${text}</div>`

        let params = {
            title: "",
            html,
            icon: null
        }

        $swal.fire(params)
    }

    static loader (text) {
        return this.loaderWithTitle("", text)
    }

    static loaderWithTitle (title, text, canclose=true) {

        //if(!ttl || ttl <= 0) ttl = 1440 * 1000;

        let htmlContent = (text) =>( `
            <div class="loading-modal flex justify-center flex-col items-center">
                <div class="my-4">${text}</div>
                <div class="loader loader-sm"></div>
            </div>
        `);

        let _swal = $swal.fire({
            title,
            html: htmlContent(text),
            //timer: ttl,
            timerProgressBar: true,
            allowOutsideClick: false, 
            allowEscapeKey: false,
            showCloseButton: false,
            showConfirmButton: canclose,
            confirmButtonText: "Close",
        })

        _swal.hideCloseBtn = () => {
            _swal.update({  showCloseButton: false, showConfirmButton: false })
        }

        _swal.showCloseBtn = () => {
            _swal.update({  showCloseButton: true, showConfirmButton: true })
        }

        _swal.updateText = (title, text) => {
           _swal.update({ title, html: htmlContent(text) })     
        }

        return _swal
    }

    static errorAlert = (msg) => this.mAlert( msg )

    static successAlert = (msg) => this.mAlert( msg )

    static showToast(text, autoclose=true) {
        EventBus.emit("open-toast", { text, autoclose })
    }

    // call blocking task
    static runBlocking(callback = () => {}){
        return (new Promise((resolve, reject) => {
            window.setTimeout(async () => {
                try {
                    let result = await callback()
                    resolve(result)
                } catch(e) {
                    reject(e)
                }
            },50)
        }))
    } //end call blocking 


    static maskAddress(address, firstLen=4, lastLen=4) {
        return (address.substring(0, firstLen)+"..."+address.substr((address.length - lastLen), lastLen))
    }
}