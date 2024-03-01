/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import Swal from 'sweetalert2'
import "sweetalert2/src/sweetalert2.scss"
import Status from './Status'
import {prng_alea} from 'esm-seedrandom';
import { ZeroAddress, isAddress as ethersIsAddress, formatUnits, getAddress, parseUnits } from 'ethers';
import { v5 as uuidv5 } from 'uuid';
import appConfig from "../config/app.js"
import * as dayjs from 'dayjs'
import Http from './Http.js';
import { v4 as uuidv4 } from 'uuid';


export default class Utils {

    static nativeTokenAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    static generalErrorMsg = "An unknown error occured, try again later"
    static generalErrorStatus =  Status.error(this.generalErrorMsg)
    static openAppFromChatPlatform = "open the app from a chat platform such as telegram"
    static zeroAddr = ZeroAddress

    static isNativeToken(token) {
        return (token.toLowerCase() == this.nativeTokenAddr.toLowerCase())
    }

    static isZeroAddr = (addr) => addr == ZeroAddress

    static logError(msg, err){
        console.log(msg)
        if(err){
            console.log(err)
            console.log(err.stack)
        }
    }

    static getSwal(extraOpts = {}) {

        //let position = (this.isExpanded()) ? "center" : "top"

        return Swal.mixin({
           // position,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn mx-1 shadow-lg px-5 btn-primary rounded-pill',
                cancelButton: 'btn  mx-1 px-5 btn-warning rounded-pill',
                denyButton: 'btn  mx-1 px-5 btn-info rounded-pill',
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

    static async txAlert({ text, icon="", explorerUrl }) {


       // console.log("explorer===>", explorerUrl)

        let html = `
            <div>
                <div class='center-vh'><h5>${text}</h5></div>
            <div>
        `

        if(icon == "") icon = `tx_success.png`
        

        let imageUrl = `/images/${icon}`

        try { (new Image()).src = imageUrl } catch(e){}

        return this.getSwal().fire({
            title: "",
            html,
            showConfirmButton: true, 
            confirmButtonText: "View Tx.",
            preConfirm: () => window.open(explorerUrl),
            showCloseButton: false,
            showDenyButton: true,
            denyButtonText: "Close",
            imageUrl,
            imageWidth: '128px',
            imageAlt: ''
        })
    }


    static showConfirmPopup({
        title,
        text,
        confirmText = "Yes!",
        cancelText  = "No"
    }) {
        return this.getSwal().fire({
            title,
            text,
            showConfirmButton: true, 
            confirmButtonText: confirmText,
            showCloseButton: false,
            showDenyButton: true,
            denyButtonText: cancelText,
        })
    }

    static mAlert(text, opts = {}) {

        let {
            ttl = null,
        } = opts

        //let position = (this.isExpanded()) ? "center" : "top"

        let html = `<div class="mt-4">${text}</div>`

        let params = {
            title: "",
            html,
            icon: null,
            ///position
        }

        if(ttl != null) {
            params.timer = (ttl * 1000)
            params.timerProgressBar = true 
            params.allowOutsideClick = false
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

        //console.log("this.isExpanded()===>", this.isExpanded())
        
        let position = (this.isExpanded()) ? "center" : "top"

        //if(!ttl || ttl <= 0) ttl = 1440 * 1000;

        let htmlContent = (text) =>( `
            <div class="loading-modal text-center flex justify-center flex-col items-center">
                <div class="my-4">${text}</div>
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
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
        const Toast = Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
              toast.onclick = () => Toast.close()
            },
            backdrop: false,
            background: this.getCssVar('bs-body-bg-dark-2')
          });

          Toast.fire({
            icon: "success",
            title: text
          });
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
        let cdnUrl = (appConfig.crypto_icons_cdn || "").trim()
        let uri = `${cdnUrl}/images/crypto/${symbol.toLowerCase()}.svg`
        return uri
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

    static async copyText(opts = {}) {

        let { text, showToast=false, successText = "Copied", failedText = "Copy failed" } = opts
       
        let copied = window.navigator.clipboard.writeText(text);

        if(showToast){
            Utils.toast((copied) ? successText: failedText)
        }

        return copied
    }

    static arrayRandom(arr, seed="") {
        let myrng = prng_alea(seed);
        return  arr[Math.floor(myrng.quick() * arr.length)]
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


    static async waitInSecs(timeInSecs) {
        return (new Promise((resolve) => {
            setTimeout(() => resolve(true), timeInSecs * 1000)
        }))
    }

    static isAddress(addr) {
        try {
            getAddress(addr)
            return true
        } catch(e){
            return false
        }
    }
    
    static getImportConfirmHtmlMsg(tokenInfo){

        let symbol = tokenInfo.symbol.toUpperCase()
        let clz = 'd-flex justify-content-between my-2 w-full'

        let html =  `
            <div class='${clz}'>
                <div class='text-primary'>Name:</div>      
                <div class='ms-2 fw-medium'>${tokenInfo.name}</div>
            </div>
            <div class='${clz}'>
                <div class='text-primary'>Symbol:</div>
                <div>${symbol}</div>
            </div>
            <div class='${clz}'>
                <div class='text-primary'>Decimals:</div>
                <div>${Number(tokenInfo.decimals)}</div>
            </div>
        `

        if('balanceOfDecimal' in tokenInfo){
            html += `<div class='${clz}'>
                        <div class='text-primary'>Balance:</div>
                        <div>${tokenInfo.balanceOfDecimal} ${symbol}</div>
                    </div>`
        }

        return html
    }

    static getImportNFTConfirmMsg(nftInfo) {

        let imgUrl = Utils.getNFTPreviewUrl(nftInfo)

        let clz = 'd-flex justify-content-between my-3 w-full align-items-center'
        let imgStyle = 'max-width: 100%; height: 140px;'
        let keyClz = 'text-start hint muted fs-12 fw-bold'
        let valueClz = 'text-break text-end ps-2'

        let html =  `
            <div class='d-flex justify-content-center mb-1'>
                <img src="${imgUrl}" 
                    style='${imgStyle}' 
                    class='rounded-lg'
                />
            </div>
            <div class='${clz}'>
                <div class='${keyClz}' style='width:85px;'>Name:</div>      
                <div class='${valueClz}'>${nftInfo.name}</div>
            </div>
            <div class='${clz}'>
                <div class='${keyClz}'>Token ID:</div>      
                <div class='${valueClz}'>${nftInfo.tokenId}</div>
            </div>
            <div class='${clz}'>
                <div class='${keyClz}' style='width:160px;'>Contract:</div>
                <div class='${valueClz}'>${nftInfo.collection}</div>
            </div>
        `

        return html
    }

    static generateUID(str) {
        const ns = "fbaf17b3-005d-4cee-ac09-5020446ef747"
        return uuidv5(str, ns);
    }
    
    static getNFTPreviewByName(imageName, size="small") {
        return `${appConfig.server_url}/media/nfts/images/${size}/${imageName}.webp`
    }

    static getNFTPreviewUrl(itemObj, size="small") {

        let image = (itemObj.media || {}).image || {}
        let imageName = (image.name || "").toString().trim()
        
        //console.log("image===>", imageName)
        let isCustomImport = ("isCustomImport" in itemObj && itemObj.isCustomImport == true)

        if(imageName != ""){
            
            return Utils.getNFTPreviewByName(imageName, size)

        } else if("url" in image && 
            image.url != '' && 
            !["missing_small.png"].includes(image.url)
        ){
            
            let tokenId = (itemObj.tokenId || "").toString().trim()
            let server = `${appConfig.server_url}`
            let chainId = itemObj.chainId

            if(isCustomImport){
                return image.url
            } else {
                return (tokenId != "") 
                    ? `${server}/nft/images/${size}/${chainId}/${itemObj.collection}/${tokenId}`
                    : `${server}/collection/images/${size}/${chainId}/${itemObj.contract}`
            }
        } else {

            return  "/images/nft-small.jpg";
            /*
            return (size == "large") 
            ? "/images/nft-large.jpg" 
            : "/images/nft-small.jpg"
            */
        }
    }

    static countStrInstance(_str, _inst) {
        return _str.split(_inst).length - 1;
    }

    static isValidFloat(no) {
        no = no.toString()
        let dotCount = Utils.countStrInstance(no, ".")
        return (/[0-9\.]+/g.test(no) &&  [0,1].includes(dotCount))
    }

    static formatFiat(val, decimals=8) {

        if(!val) return "";

        val = val.toString()

        if(val.startsWith("0.")){
            if(val.length > 8){
                decimals = 8
            }
        }

        return Number(parseFloat(val).toFixed(decimals))
    }

    static formatCrypto(val, decimals=8) {
        
        if(!val || val == null || val=="") return ""

        //console.log("val===>", val)

        // lets get decimals 
        let valStr = val.toLocaleString('fullwide', {useGrouping:false})

        let requiredDecimals;

        if(!(/^([0-9]+\.[0-9]+)$/g).test(valStr)){
            return val
        }

        let [ integerPart, decimalPart ] = valStr.split(".")

        let decimalsPartLeading0 = 0;
        let decPartArr = decimalPart.split("")

        for(let char of decPartArr){
            if(char.toString() == '0'){
                decimalsPartLeading0 += 1
            } else {
                break;
            }
        }
        
        //console.log("decimalsPartLeading0===>", decimalsPartLeading0)
        requiredDecimals = parseInt(decimalsPartLeading0) + decimals;
        
        let newDecimalPart = decimalPart.substring(0, requiredDecimals)

        let finalVal = `${integerPart}.${newDecimalPart}`

        ////console.log(val +"---", finalVal)
        
        return finalVal
    }


    static formatDateMillis(dateMillis, format="lll"){
        if(!dateMillis || (dateMillis || "".toString().trim() == "")) return ""
        return dayjs(dateMillis).format(format)
    }

    static sleep(delayInSecs) {
        return (new Promise((resolve, reject)=> {
            setTimeout(()=>{
                resolve()
            }, (delayInSecs * 1000))
        }))
    }

    static arrayChunk(arr, chunkSize) {
        const chunks = [];

        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            chunks.push(chunk);
        }

        return chunks
    }

    static lastArrayItem(arr) {
        return (arr[arr.length - 1] || null)
    }

    static getQuoteSrcInfo(group) {
        if(['uni_v2', 'uni_v3', 'tjoe_v20', 'tjoe_v21'].includes(group)){
            return { name: "direct", cssClass: "btn-warning" }
        } else {
            return { name: "aggregator", cssClass: "btn-success" }
        }
    }


    static percentToBPS(valuePercent) {
       /**
         * using the standed percentage * 100 = basis point,
         * so from our basis point (value * bps) / (100 * 100)
         * the first 100 is for percentage to fraction, the second 100 is the 100 we multiplied 
         * to achieve the basis point
         */
        return (valuePercent * 100); 
    }

    
    static calPercentBPS(value, bps) {
        /**
         * using the standed percentage * 100 = basis point,
         * so from our basis point (value * bps) / (100 * 100)
         * the first 100 is for percentage to fraction, the second 100 is the 100 we multiplied 
         * to achieve the basis point
         */
        let DIVISOR = 10_000;
        return (BigInt(value.toString()) * BigInt(bps.toString())) / BigInt(DIVISOR)
    }


    static getBalanceFromTokenItem (tokenItem){
    
        let balances = tokenItem.balances || null 
    
        if(balances == null) return ""
        
        let wallet = activeWallet.value.address.toLowerCase()
        let balance = balances[wallet].formatted;
    
        if(balance == 0) return ""
    
        return `${Utils.formatCrypto(balance, 4)}`
    }

    static async importJson(url) {
        let resultStatus = await Http.getJson(url)

        if(resultStatus.isError()){
            throw new Error(resultStatus.getMessage())
        }
        
        let data = resultStatus.getData() || {}

        return data
    }

    static isStandalonePWA() {
        return (window.app_platform && (window.matchMedia('(display-mode: standalone)').matches 
        || window.navigator.standalone === true))
    }

    static appPlatform = () => window.app_platform
    static isPlatform = (name) => this.appPlatform() == name

    static getUUID  = () => uuidv4()
    
    static hexToInt(val){
        return (val.toString().startsWith("0x"))
                    ? parseInt(val,16)
                    : val
    }

    static toHex(_val) {
        return ("0x"+_val.toString(16))
    }

    static parseUrl(url){
        return (new URL(url))
    }

    static getFaviconURL(url, size=16){
        return appConfig.favicon_loader
                    .replace("{{DOMAIN}}", url)
                    .replace("{{SIZE}}", size)
    }
}
