/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { encryptKeystoreJson, decryptKeystoreJson, getAddress, Wallet as ethersWallet } from "ethers"
import Utils from "./Utils"
import Status from "./Status"
import { toValue } from "vue"


export default class KeyStore {

    static DEFAULT_WALLET_KEY = (userId) => `${userId}__botfi_dw_info`
    static ACCOUNTS_KEY = (userId) => `${userId}__botfi_accts`

    static async getDefaultWallet(userId,password) {
        try {
            
            //console.log("password===>", password)

            if(password == ''){
                return Status.errorPromise("password_required")
            }

            let defaultWalletDataStr = localStorage.getItem(this.DEFAULT_WALLET_KEY(userId)) || ""

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

    static async resetAccount(userId){
        localStorage.removeItem(this.DEFAULT_WALLET_KEY(userId))
        localStorage.removeItem(this.ACCOUNTS_KEY(userId))
        
    }

    static hasDefaultWallet(userId) {
        return (localStorage.getItem(this.DEFAULT_WALLET_KEY(userId)) || "").trim().length > 0
    }

    static async saveDefaultWallet(userId, password, walletInfo) {
        try {

            let defaultWalletKey = this.DEFAULT_WALLET_KEY(userId)

            if ((localStorage.getItem(defaultWalletKey) || "").length > 0){
                return Status.errorPromise("Default account already exists, it cannot be overwritten")
            }

            password = toValue(password)

            let encryptedWallet = await walletInfo.encrypt(password)

            let encryptedData = { data: encryptedWallet }

            localStorage.setItem(defaultWalletKey, JSON.stringify(encryptedData))

            let walletAcctData = {
                address:    walletInfo.address, 
                privateKey: walletInfo.privateKey,
                index:      0,
                imported:   false
            }

            let saveAccountStatus = await this.saveAccount(userId, password, walletAcctData)

            if(saveAccountStatus.isError()){
                this.resetAccount(userId)
                return saveAccountStatus
            }
            
            return Status.successData(walletInfo)
        } catch(e){
            Utils.logError(`walletStore#saveDefaultWallet:`, e)
            return Status.errorPromise()
        }
    }

    static async getAccounts(userId, password) {

        password = toValue(password)

        let walletsStr = (localStorage.getItem(this.ACCOUNTS_KEY(userId)) || "").trim()

        if(walletsStr == ""){
            return Status.successData({})
        }

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

    static async saveAccount(userId, password, opts = {}) {

        let { name = "", address, privateKey, index = 0, imported} = opts;

        let wallets = {}

        let dbWalletsStr = (localStorage.getItem(this.ACCOUNTS_KEY(userId)) || "").trim()

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
            imported
        }

        let key = address.toLowerCase().substring(2);

        wallets[key] = dataToSave

        localStorage.setItem(this.ACCOUNTS_KEY(userId), JSON.stringify(wallets))
 
        return Status.successPromise()
    }

}