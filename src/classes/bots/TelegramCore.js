
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

    mainButton({ text = "Continue", onClick= (() => {}) }) {
        
        let _isSupported = (this.webApp && this.webApp.platform != 'unknown')

        //console.log("_isSupported===>", _isSupported)

        if(!_isSupported) {
            return this.notSupported()
        }

        let mb = this.webApp.MainButton;

        mb.enable()
        mb.setText(text)
        mb.onClick(onClick)

        return {
            isSupported: () => _isSupported,
            show: ()                => mb.show(),
            hide: ()                => mb.hide(),
            disable: ()             => mb.disable(),
            setOnClick: (callback)  => mb.onClick(callback),
            showProgress: ()        => mb.showProgress(false),
            hideProgress: ()        => mb.hideProgress()
        }
    }

    platform() {
        if(!this.webApp) return "unknown"
        return this.webApp.platform
    }

    backBtn (onClick = null) {
        let _isSupported =  (this.webApp != null && 
                            this.webApp.platform != 'unknown' &&
                            this.webApp.isVersionAtLeast(6.1)
                        )
        if(!_isSupported){
            return this.notSupported()
        }

        let bb = this.webApp.BackButton;
        
        return {
            enable:  () => bb.onClick(onClick),
            show:    () => bb.show(),
            hide:    () => bb.hide(),
            disable: (hide=true) => {
                bb.disable(()=>{})
                if(hide) bb.hide()
            }
        }
    }

    nativeAlert(text, onClose = (() => {})) {

        let _isSupported =  ( this.webApp != null && 
                              this.webApp.platform != 'unknown' &&
                              this.webApp.isVersionAtLeast(6.2)
                            )

        if(!_isSupported){
            return this.notSupported()
        }

        return {
            show: () =>  this.webApp.showAlert(text, onClose),
            isSupported: () => true 
        }
    }
    
    expand = () => this.webApp.expand()
    
    isExpanded = () => this.webApp.isExpanded

    getViewportHeight = () => this.webApp.viewportHeight
}