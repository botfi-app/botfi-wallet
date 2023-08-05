/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */


export default class KeyStore {

    static getMnemonic = async (password="") => {
        try {
            
            if(password == ''){
                return Status.errorPromise("password_required")
            }

            let data = localStorage.getItem("mnemonic") || ""

            if(data.trim() == ""){
                return Status.successData()
            }

            let dataObj;

            try { 
                dataObj = JSON.parse(data);
            } catch(e){
                return Status.errorPromise("data_corrupted")
            }

            let decryptData;

            try {
                
                decryptData =   window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: dataObj.iv }, 
                    key, 
                    dataObj['ciphertext']
                );

            } catch(e){
                return Status.errorPromise("invalid_password")
            }

            return Status.successData(decryptData)
        } catch(e){
            Utils.logError(`KeyStore#getMnemonic:`, e)
            return Status.errorPromise()
        }
    }


}