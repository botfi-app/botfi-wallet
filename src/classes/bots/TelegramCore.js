
export default class TelegramCore {

    telegram   = null;
    webApp = null;
    botPlatform = "telegram"
    isTelegram  = true 

    constructor(_tgram = {}) {
        console.log("_tgram===>", _tgram)
        this.telegram = _tgram
        this.webApp = _tgram.WebApp || null;
    }

    isMinVersion(version) {
        return (this.webApp && 
                this.platform() != 'unknown' &&
                this.webApp.isVersionAtLeast(version)
            )
    }

    // get account 
    getUserInfo() {
        
        if(!this.webApp) return null 

        let user = this.webApp.initDataUnsafe.user || null;

        if(user == null) return null

        return {
            id: user.id, 
            username: user.username,
            firstName: user.first_name,
            lastName: user.lastName
        }
    }

    getUid() {
        let userInfo = this.getUserInfo()
        if(userInfo == null) {
            return null
        }

        return `${this.botPlatform}_${userInfo.id}`
    }

    notSupported() {
        return { isSupported: () => false }
    }

    mainButton({ text = "Continue", onClick = null }) {
        
        let _isSupported = (this.webApp && this.platform() != 'unknown')

        //console.log("_isSupported===>", _isSupported)

        if(!_isSupported) {
            return this.notSupported()
        }

        let mb = this.webApp.MainButton;

        let hide = () => mb.hide()
        let disable = () => mb.disable()
        let setOnClick = (callback)  => mb.onClick(callback)
        
        let destroy = () => {
            disable();
            hide();
            setOnClick(null)
        }

        mb.enable()

        if(onClick != null && typeof onClick == 'function'){
            mb.setText(text)
            mb.onClick(onClick)
        }

        return {
            isSupported: () => _isSupported,
            show: () => mb.show(),
            hide,
            disable,
            setOnClick,
            destroy,
            showProgress: ()        => mb.showProgress(false),
            hideProgress: ()        => mb.hideProgress()
        }
    }

    platform() {
        if(!this.webApp) return "unknown"
        return this.webApp.platform
    }

    backBtn (onClick = null) {
        
        let _isSupported =  (this.isMinVersion("6.10"))

        if(!_isSupported){
            return this.notSupported()
        }

        let bb = this.webApp.BackButton;
        
        return {
            enable:  () => bb.onClick(onClick),
            show:    () => bb.show(),
            hide:    () => bb.hide(),
            disable: (hide=true) => {
                bb.offClick(()=>{})
                if(hide) bb.hide()
            }
        }
    }

    nativeAlert(text, onClose = (() => {})) {

        let _isSupported =  ( this.isMinVersion("6.2"))

        if(!_isSupported){
            return this.notSupported()
        }

        return {
            show: () =>  this.webApp.showAlert(text, onClose),
            isSupported: () => true 
        }
    }
    
    expand = () => this.webApp.expand();
    
    isExpanded = () => this.webApp.isExpanded;

    getViewportHeight = () => this.webApp.viewportHeight;

    // cloud store
    cloudStore() {

        let isSupported = false //(this.isMinVersion("6.9"))

        if(!isSupported){
            return this.notSupported()
        }

        let cs = this.webApp.CloudStorage 

        let getItem = (key) => ((new Promise((resolve, reject) => {
            //if(!isSupported) return null;
            cs.getItem(key, function(err, result){
                if(err){ reject(err) }
                else { resolve(result) }
            })
        })))

        let setItem = (key, value) => ((new Promise((resolve, reject) => {
            //if(!isSupported) return false;
            cs.setItem(key, value, (err) => {
                if(err){ reject(err) }  
                else { resolve(true) }
            })
        })))

        let removeItem = (key) => ((new Promise((resolve, reject) => {
            //if(!isSupported) return false;
            cs.removeItem(key, (err) => {
                if(err){ reject(err) }  
                else { resolve(true) }
            })
        })))

        /*
        cs.setItem("__bname", "Zak", function(err) {
            ///if(err) console.log("setItem Err========>>>",err)
            console.log("Name Set =========>>>>")
            cs.getItem("__bname", function(err, result) {
                console.log("err===>", err)
                console.log("result===>", result)
                if(err) console.log("setItem Error=====>>>>", err)
                console.log("result======>", result)
            })
        })*/


        return {
            isSupported: () => isSupported,
            setItem, 
            getItem,
            removeItem
        }
    }


    qrCodeReader() {

        let _p =  this.platform().toLowerCase()
        let isSupported =  (this.isMinVersion("6.4") && ['android', 'ios'].includes(_p))

        if(!isSupported){
            return this.notSupported()
        }

        let reader = this.webApp.showScanQrPopup 

        return {
            isSupported: () => isSupported,
            show: (title, callback) => {
                reader({ title }, callback)
            },
            close: () => this.webApp.closeScanQrPopup()
        }
    }


    clipboard() {

        //console.log("this.webApp.version====>", this.webApp.version)
        //let _p = this.webApp.platform.toLowerCase()
        let isSupported =  (this.isMinVersion("6.4"))

        if(!isSupported){
            return this.notSupported()
        }

        return {
            isSupported: () => isSupported,
            readText: (callback) => this.webApp.readTextFromClipboard(callback)
        }
    }

}