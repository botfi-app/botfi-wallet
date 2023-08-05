/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */
import { HDNodeWallet } from "ethers/src.ts/wallet/hdwallet"

export default class KeyStore {

    static SP_STORE_KEY = "__sp_infp"

    static getDefaultWallet = async (password="") => {
        try {
            
            if(password == ''){
                return Status.errorPromise("password_required")
            }

            let data = localStorage.getItem(SP_STORE_KEY) || ""

            if(data.trim() == ""){
                return Status.errorPromise("No default wallet found")
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
            Utils.logError(`KeyStore#getDefaultWallet:`, e)
            return Status.errorPromise()
        }
    }

    static hasDefaultWallet() {
        return (localStore.getItem(this.SP_STORE_KEY) || "").trim().length > 0
    }

    static async saveDefaultWallet(password, walletInfo) {
        try {

            if ((localStore.getItem(this.SP_STORE_KEY) || "").length > 0){
                return Status.errorPromise("Seed phrase already exists, cannot be overwritten")
            }

            

        } catch(e){
            Utils.logError(`KeyStore#saveSeedPhraseInfo:`, e)
            return Status.errorPromise()
        }
    }


}