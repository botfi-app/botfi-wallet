/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { encryptKeystoreJson, decryptKeystoreJson, getAddress, Wallet as ethersWallet } from "ethers"
import Utils from "./Utils"
import Status from "./Status"
import { toValue } from "vue"


export default class KeyStore {

    static DEFAULT_ACCOUNT_KEY = "__botfi_dw_info_"
    static ACCOUNTS_KEY = "__botfi_accts_"


    static async getDefaultWallet(password="") {
        try {
            
            //console.log("password===>", password)

            if(password == ''){
                return Status.errorPromise("password_required")
            }

            let defaultWalletDataStr = localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || ""

            if(defaultWalletDataStr == ""){
                return Status.errorPromise("default_account_not_found")
            }

            let walletData = JSON.parse(defaultWalletDataStr)

            if(!("data" in walletData)){
                await this.resetAccount()
                return Status.errorPromise("default_account_not_found")
            }

            let decryptedData;

            try {
                decryptedData = await ethersWallet.fromEncryptedJson(walletData.data, password)
            } catch(e){
                
                if(e.code == "INVALID_ARGUMENT" && e.argument == "password"){
                    return Status.errorPromise("Invalid password")
                }

                Utils.logError(`KeyStore#getDefaultWallet:`, e)
                return Status.errorPromise("wallet_decryption_failed")
            }

            return Status.successData(decryptedData)

        } catch(e){
            Utils.logError(`walletStore#getDefaultWallet:`, e)
            return Status.errorPromise("failed to fetch default wallet")
        }
    }

    static async resetAccount(){
        localStorage.removeItem(this.DEFAULT_ACCOUNT_KEY)
        localStorage.removeItem(this.ACCOUNTS_KEY)
        
    }

    static hasDefaultWallet() {
        return (localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || "").trim().length > 0
    }

    static async saveDefaultWallet(password, walletInfo) {
        try {

            if ((localStorage.getItem(this.DEFAULT_ACCOUNT_KEY) || "").length > 0){
                return Status.errorPromise("Default account already exists, it cannot be overwritten")
            }

            password = toValue(password)

            let encryptedWallet = await walletInfo.encrypt(password)

            let encryptedData = { data: encryptedWallet }

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

        password = toValue(password)

        //console.log("walletsStr===>", walletsStr)

        let walletsObj = {}

        try { walletsObj = JSON.parse(walletsStr) } catch(e){}

        if(Object.keys(walletsObj).length == 0){
            return Status.successData({})
        }

        ///console.log("password===>",password)

        for(let key of Object.keys(walletsObj)){
            try {
                let item = walletsObj[key]
                let decryptedAcct = await ethersWallet.fromEncryptedJson(item.wallet, password)
                walletsObj[key].wallet = decryptedAcct

                if(item.name == ''){
                    walletsObj[key].name = decryptedAcct.address;
                }
            } catch(e){ 
                console.log("KeyStore#getAcounts:", key, e)
                continue; 
            }
        }

        return Status.successData(walletsObj)
    }

    static async saveAccount(password, { name = "", address, privateKey, index = 0, isImported}) {
        
        let wallets = {}

        let dbWalletsStr = (localStorage.getItem(this.ACCOUNTS_KEY) || "").trim()

        if(dbWalletsStr != ""){
            try { 
                wallets = JSON.parse(dbWalletsStr) 
            } catch(e){
                return Status.errorPromise("Failed to decode accounts store data")
            }
        }

        address = getAddress(address)

        let walletInfo = {
            address, 
            privateKey
        }

        password = toValue(password)
        
        //console.log("password===>", password)

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