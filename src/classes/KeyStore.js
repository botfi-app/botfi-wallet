/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { encryptKeystoreJson, decryptKeystoreJson, getAddress } from "ethers"
import Utils from "./Utils"
import Status from "./Status"


export default class KeyStore {

    static DEFAULT_ACCOUNT_KEY = "__botfi_dw_info_"
    static ACCOUNTS_KEY = "__botfi_accts_"


    static async getDefaultWallet(password="") {
        try {
            
            if(password == ''){
                return Status.errorPromise("password_required")
            }

            let data = localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || ""

            if(data.trim() == ""){
                return Status.errorPromise("No default wallet found")
            }

            let defaultAcctStr = localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || ""

            if(defaultAcctStr == ""){
                return Status.errorPromise("default_account_not_found")
            }

            let decryptedData;

            try {
                decryptedData = await decryptKeystoreJson(defaultAcctStr)
            } catch(e){
                Utils.logError(`KeyStore#getDefaultWallet:`, e)
                return Status.errorPromise("wallet_decryption_failed")
            }


            return Status.successData(decryptedData)

        } catch(e){
            Utils.logError(`walletStore#getDefaultWallet:`, e)
            return Status.errorPromise("failed to fetch default wallet")
        }
    }

    static hasDefaultWallet() {
        return (localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || "").trim().length > 0
    }

    static async saveDefaultWallet(password, walletInfo) {
        try {

            if ((localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || "").length > 0){
                return Status.errorPromise("Default account already exists, it cannot be overwritten")
            }

            let mnemonic = {
                entropy: walletInfo.mnemonic.entropy,
                locale:  walletInfo.mnemonic.wordlist.locale,
                path:    walletInfo.path
            }

            let data = { 
                address:    walletInfo.address, 
                privateKey: walletInfo.privateKey,
                mnemonic
            }

            //console.log("data===>", data)

            let encryptedData = await encryptKeystoreJson(data, password)

            localStorage.setItem(this.DEFAULT_ACCOUNT_KEY, JSON.stringify(encryptedData))

            let walletAcctData = {
                address:    walletInfo.address, 
                privateKey: walletInfo.privateKey,
                index:      0
            }

            let saveAccountStatus = await this.saveAccount(password, walletAcctData)

            if(saveAccountStatus.isError()){
                localStorage.removeItem(this.DEFAULT_ACCOUNT_KEY)
                return saveAccountStatus
            }
            
            return Status.successData(walletInfo)
        } catch(e){
            Utils.logError(`walletStore#saveDefaultWallet:`, e)
            return Status.errorPromise()
        }
    }

    static async getAccounts(password) {

        let walletsStr = (localStorage.getItem(this.ACCOUNTS_KEY) || "").trim()

        if(walletsStr == ""){
            return Status.successData({})
        }

        //console.log("walletsStr===>", walletsStr)

        let walletsObj = {}

        try { walletsObj = JSON.parse(walletsStr) } catch(e){}

        if(Object.keys(walletsObj).length == 0){
            return Status.successData({})
        }

        //console.log("walletsObj===>",walletsObj)

        for(let key of Object.keys(walletsObj)){
            let item = walletsObj[key]
            let decryptedAcct = await decryptKeystoreJson(item.wallet, password)
            walletsObj[key].wallet = decryptedAcct
        }

        return Status.successData(walletsObj)
    }

    static async saveAccount(password, { name = "", address, privateKey, index = 0, isImported}) {
        
        let wallets = {}

        let dbWalletsStr = (localStorage.getItem(this.ACCOUNTS_KEY) || "").trim()

        if(dbWalletsStr != ""){
            try { wallets = JSON.parse(dbWalletsStr) } catch(e){}

        }

        address = getAddress(address)

        let walletInfo = {
            address, 
            privateKey
        }

        // lets encrypt the wallet account 
        let encryptedWallet = await encryptKeystoreJson(walletInfo, password)

        let dataToSave = {
            name, 
            wallet: encryptedWallet,
            index, 
            isImported
        }

        let key = address.toLowerCase().substring(2);

        wallets[key] = dataToSave

        localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(wallets))
 
        return Status.successPromise()
    }

}