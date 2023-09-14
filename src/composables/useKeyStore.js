/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { getAddress, Wallet as ethersWallet } from "ethers"
import Utils from "../classes/Utils"
import Status from "../classes/Status"
import { toValue } from "vue"
import Crypt from "../classes/Crypt"
import { useSimpleDB } from "./useSimpleDB"
import ErrorCodes from "../classes/ErrorCodes"


export const useKeystore = () => {

    const DB = useSimpleDB()
    
    const DEFAULT_WALLET_KEY = `__botfi_dw_info`
    const WALLETS_KEY = `__botfi_wallets`
    

    const getDefaultWallet = async (password) => {
        try {
            
            if(password == ''){
                return Status.error("Password is required")
                             .setCode(ErrorCodes.PASSWORD_REQUIRED)
            }

            let defaultWalletData = await DB.getItem(DEFAULT_WALLET_KEY, true)
            
            if(defaultWalletData == null){
                return Status.error("Default wallet not found")
                             .setCode(ErrorCodes.DEFAULT_WALLET_NOT_FOUND)
            }
            
            let decryptedData;

            try {
               
               decryptedData = await Crypt.decrypt(password, defaultWalletData)

            } catch(e){
                
                Utils.logError(`useKeyStore#getDefaultWallet:`, e)
                
                return Status.error("Wallet decryption failed, check password & try again")
                             .setCode(ErrorCodes.WALLET_DECRYPTION_ERROR)
            }

            return Status.successData(decryptedData)

        } catch(e){
            Utils.logError(`walletStore#getDefaultWallet:`, e)
            return Status.errorPromise("Failed to fetch default wallet")
        }
    }

    const resetWallets = async () => {
        await DB.removeItem(DEFAULT_WALLET_KEY, true)
        await DB.removeItem(WALLETS_KEY, true)
    }

    const hasDefaultWallet = async () => {
       return (await DB.getItem(DEFAULT_WALLET_KEY, true)) != null
    }

    const saveDefaultWallet = async (password, walletInfo) => {
        try {

            let defaultWallet = await DB.getItem(DEFAULT_WALLET_KEY, true)

            if (defaultWallet != null){
                return Status.error("Default account already exists, it cannot be overwritten")
                            .setCode(ErrorCodes.DEFAULT_WALLET_NOT_FOUND)
            }

            password = toValue(password)

            let phrase = walletInfo.mnemonic.phrase

            let encryptedData = await Crypt.encrypt(password, { phrase, lastIndex: 0 })

            await DB.setItem(DEFAULT_WALLET_KEY, encryptedData, true)

            let walletAcctData = {
                name:           "Default",
                address:        walletInfo.address, 
                privateKey:     walletInfo.privateKey,
                walletIndex:    0,
                imported:       false
            }

            let saveWalletStatus = await saveWallet(password, walletAcctData)

            if(saveWalletStatus.isError()){
                await resetWallets()
                return saveWalletStatus
            }
            
            return Status.successData(walletInfo)

        } catch(e){
            Utils.logError(`walletStore#saveDefaultWallet:`, e)
            return Status.errorPromise()
        }
    }

    const getWallets = async () => {

        //password = toValue(password)

        let walletsArr = await DB.getItem(WALLETS_KEY, true)

        if(walletsArr == null){
            return Status.successData([])
        }

        return Status.successData(walletsArr)
    }


    const saveWallet = async (password, opts = {})  => {

        let { name = "", address, privateKey, walletIndex, imported} = opts;

        let wallets = await DB.getItem(WALLETS_KEY, true)

        if(wallets == null){
            wallets = []
        }

        address = getAddress(address)

        password = toValue(password)
        
        let encryptedPk = await Crypt.encrypt(password, privateKey)

        let dataToSave = {
            name, 
            pk: encryptedPk,
            address,
            wIndex: walletIndex, 
            imported
        }

        wallets.unshift(dataToSave)

        await DB.setItem(WALLETS_KEY, wallets, true)
 
        return Status.successPromise()
    }

    // derive wallet
    const deriveChildWallet = async (password, walletName) => {
        try {

            password = toValue(password)

            //console.log("password===>", password)

            // lets get default wallet 
            let defaultWalletStatus = await getDefaultWallet(password)

            if(defaultWalletStatus.isError()){
                return defaultWalletStatus
            }

            let dwallet = defaultWalletStatus.getData()

            let walletIndex = dwallet.lastIndex + 1;

            let wallet =  ethersWallet.fromPhrase(dwallet.phrase)

            let childWallet = wallet.deriveChild(walletIndex)

            let walletAcctData = {
                name:       walletName,
                address:    childWallet.address, 
                privateKey: childWallet.privateKey,
                walletIndex,
                imported:   false
            }

            let saveWalletStatus = await saveWallet(password, walletAcctData)

            let newDefaultWallet = { phrase: dwallet.phrase, lastIndex: walletIndex }

            if(saveWalletStatus.isSuccess()) {
                let encryptedData = await Crypt.encrypt(password, newDefaultWallet)
                await DB.setItem(DEFAULT_WALLET_KEY, encryptedData, true)
            }

            return Status.successData(newDefaultWallet)
            
        } catch(e){
            ///Utils.logError("useKeyStore#deriveChildWallet:",e)
            console.log(e, e.stack)
            return Utils.generalErrorStatus
        }
    } 


    const removeWallet = async (addr) => {

        let walletsStatus = await getWallets()

        if(walletsStatus.isError()){
            return walletsStatus
        }

        let wallets = walletsStatus.getData()

        let newWallets = wallets.filter(v => v.address.toLowerCase() != addr.toLowerCase())

        //console.log("newWallets===>", newWallets)
        
        await DB.setItem(WALLETS_KEY, newWallets, true)

        return Status.success()
    }

    const updateWalletName = async (addr, newName) => {

        let walletsStatus = await getWallets()

        if(walletsStatus.isError()){
            return walletsStatus
        }

        let wallets = walletsStatus.getData()

        for(let index in wallets){
            let item = wallets[index]

            if(item.address.toLowerCase() == addr.toLowerCase()){
                item.name = newName
                break;
            }
        }

        await DB.setItem(WALLETS_KEY, wallets, true)

        return Status.success()
    }

    const decryptWallet = async (walletObj, password) => {
        try {

           let  decryptedData = await Crypt.decrypt(password, walletObj.pk)

           walletObj.decryptedPk = decryptedData

           //console.log(walletObj)

           return Status.success("", walletObj)

        } catch(e){
            Utils.logError("KeyStore#decryptWallet:", e)
            return Status.error("Wallet decryption failed, check password & try again")
                             .setCode(ErrorCodes.WALLET_DECRYPTION_ERROR)
        }
    }

    const importWalletFromPrivateKey = async (
        name, 
        password,
        privateKey
    ) => {
        try {

            name = toValue(name).toString().trim()
            password = toValue(password)
            privateKey = toValue(privateKey).toString().trim()

            if(!privateKey.startsWith("0x")){
                privateKey = `0x${privateKey}`   
            }

            if(!privateKey || privateKey == ''){
                return Status.errorPromise("Private key cannot be empty")
            }

            // lets check if the account exists already
            let walletsStatus = await getWallets()

            if(walletsStatus.isError()){
                return walletsStatus
            }

            let importedWallet = (new ethersWallet(privateKey)).connect()

            if(importedWallet.privateKey != privateKey){
                return Status.error("Import failed, kindly check the private key")
                            .setCode(ErrorCodes.WALLET_IMPORT_BY_PK_FAILED)
            }

            let address = importedWallet.address


            let walletsArr = walletsStatus.getData() || []

            let walletExists = false 

            for(let v of walletsArr){
                if(v.address == address){
                    walletExists = true;
                    break
                }
            }

            if(walletExists){
                return Status.error("Wallet already exists")
            }

            let walletAcctData = {
                name,
                address, 
                privateKey,
                walletIndex: -1,
                imported:   true
            }

            let saveWalletStatus = await saveWallet(password, walletAcctData)

            if(saveWalletStatus.isError()){
                return saveWalletStatus
            }

           return Status.success("", address)

        } catch(e){
            Utils.logError("KeyStore#importWalletFromPrivateKey:", e)
            return Status.error("Import failed, kindly check the private key")
                             .setCode(ErrorCodes.WALLET_IMPORT_BY_PK_FAILED)
        }
    }

    return {
        getDefaultWallet,
        resetWallets,
        hasDefaultWallet,
        saveDefaultWallet,
        saveWallet,
        getWallets,
        deriveChildWallet,
        removeWallet,
        updateWalletName,
        decryptWallet,
        importWalletFromPrivateKey
    }
}