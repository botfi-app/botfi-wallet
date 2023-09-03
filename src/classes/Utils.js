/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Swal from 'sweetalert2'
import "sweetalert2/src/sweetalert2.scss"
import Status from './Status'

export default class Utils {

    static generalErrorMsg = "An unknown error occured, try again later"
    static generalErrorStatus =  Status.error(this.generalErrorMsg)
    static openAppFromChatPlatform = "open the app from a chat platform such as telegram"

    static logError(msg, err){
        console.log(msg)
        if(err){
            console.log(err)
            console.log(err.stack)
        }
    }

    static getSwal(extraOpts = {}) {

        let position = (this.isExpanded()) ? "center" : "top"

        return Swal.mixin({
            position,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn mx-1 shadow-lg px-5 btn-primary rounded-pill',
                cancelButton: 'btn  mx-1 px-5 btn-info rounded-pill',
                popup: 'shadow-lg',
                htmlContainer: "body-bg",
            },
            ...extraOpts
        })
        
    }

    static toBool(val){
        if(typeof val === 'boolean') return val;
        val = (val || "").toString().toLowerCase().trim()
        if(val == "true" || val == "1") { return true }
        else { return false; }
    }

    static isExpanded = () => {
        let root = document.documentElement
        return (this.toBool(root.dataset.isExpanded) || false)
    }

    static mAlert(text) {

        let position = (this.isExpanded()) ? "center" : "top"

        let html = `<div class="mt-4">${text}</div>`

        let params = {
            title: "",
            html,
            icon: null,
            position
        }

        return this.getSwal().fire(params)
    }

    static getCssVar(name, selector = '') {

        if(selector == '') selector = ":root"

        let el = document.querySelector(":root")
        
        return window.getComputedStyle(el)
                     .getPropertyValue(`--${name}`);
    }

    static loader (text, canclose = false) {
        return this.loaderWithTitle("", text, canclose)
    }

    static loaderWithTitle (title, text, canclose=true) {

        let position = (this.isExpanded()) ? "center" : "top"

        //if(!ttl || ttl <= 0) ttl = 1440 * 1000;

        let htmlContent = (text) =>( `
            <div class="loading-modal flex justify-center flex-col items-center">
                <div class="my-4">${text}</div>
                <div class="loader loader-sm"></div>
            </div>
        `);

        let _swal = this.getSwal().fire({
            title,
            html: htmlContent(text),
            //timer: ttl,
            timerProgressBar: true,
            allowOutsideClick: false, 
            allowEscapeKey: false,
            showCloseButton: false,
            showConfirmButton: canclose,
            confirmButtonText: "Close",
            position
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

    static unknownErrorAlert ( text = "") {
        if(text == '') text = this.generalErrorMsg
        this.mAlert(text)
    }

    static toast(text, autoclose=true) {
        let $t = document.getElementById("main-toast")
        $t.querySelector(".text").textContent = text
        $t.classList.remove("hide")

        if(autoclose){
            setTimeout(() => { $t.classList.add("hide") }, 3_000)
        }
    }
    
    static getTokenIconName(symbol) {

        symbol = symbol.replace(/(\_|\-)testnet/ig, "").toLowerCase()
        
        //console.log("symbol==>", symbol)

        if(["hardhat", "ropsten", "rinkeby","kovan", "local", "heth"].includes(symbol)){
            symbol = "eth"
        } else if(symbol == "bsc" || symbol == "bnbchain"){
            symbol = "bnb"
        }

        return symbol;
    }

    static getTokenIconUrl(symbol) {
        symbol = this.getTokenIconName(symbol)
        //console.log("symbol===>", symbol)
        return `/images/crypto/${symbol.toLowerCase()}.svg`
    }

    static getUriPath() {
        return window.location.pathname
    }

    static isValidUrl(_str) {

        let url;
        
        try {
          url = new URL(_str);
        } catch (_) {
          return false;  
        }
      
        return url.protocol === "http:" || url.protocol === "https:";
    }

    static onlyNumber(evt) {  
        if (evt.which < 48 || evt.which > 57){
            evt.preventDefault();
        }
    }

    static async copyToClipboard(text) {
        try{
            if("clipboard" in navigator){
                await navigator.clipboard.writeText(text);
            }
            else if("execCommand" in document){
                var input = document.createElement('textarea');
                input.innerHTML = text;
                document.body.appendChild(input);
                input.select();
                var result = document.execCommand('copy');
                document.body.removeChild(input);
                return result;
            } else {
                return "failed"
            }

            return "copied"
        } catch(e){
            return "failed"
        }
    }

    static arrayRandom(arr) {
        return  arr[Math.floor(Math.random() * arr.length)]
    }

    static async toAsyncCall(callback) {
        return (new Promise((resolve, reject) => {
            try {
                resolve(callback())
            } catch(e){
                reject(e)
            }
        }))
    }
}