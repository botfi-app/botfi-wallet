/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

import { getAddress } from "ethers"
import Utils from "../classes/Utils"
import Status from "../classes/Status"
import { toValue } from "vue"
import Crypt from "../classes/Crypt"
import { useDB } from "./useDB"
import ErrorCodes from "../classes/ErrorCodes"


export const useKeystore = () => {

    const DB = useDB()
    
    const DEFAULT_WALLET_KEY = `__botfi_dw_info`
    const WALLETS_KEY = `__botfi_wallets`


    const getDefaultWallet = async (password) => {
        try {
            
            if(password == ''){
                return Status.error("Passowrd is required")
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
                
                if(e.code == "INVALID_ARGUMENT" && e.argument == "password"){
                    return Status.error("Invalid password")
                }

                Utils.logError(`useKeyStore#getDefaultWallet:`, e)
                
                return Status.error("Failed to decrypt wallet")
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

            let encryptedData = await Crypt.encrypt(password, phrase)

            await DB.setItem(DEFAULT_WALLET_KEY, encryptedData, true)

            let walletAcctData = {
                address:    walletInfo.address, 
                privateKey: walletInfo.privateKey,
                index:      0,
                imported:   false
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

    const getWallets = async (password) => {

        password = toValue(password)

        let walletsObj = await DB.getItem(WALLETS_KEY, true)

        if(walletsObj == null){
            return Status.successData({})
        }

        if(Object.keys(walletsObj).length == 0){
            return Status.successData({})
        }

        for(let key of Object.keys(walletsObj)){
            try {

                let item = walletsObj[key]

                let decryptedWallet = await Crypt.decrypt(password, item.wallet)

                walletsObj[key].wallet =  decryptedWallet

                if(item.name == ''){
                    walletsObj[key].name = decryptedWallet.address;
                }
            } catch(e){ 
                console.log("useKeyStore#getWallets:", key, e)
                continue; 
            }
        }

        return Status.successData(walletsObj)
    }


    const saveWallet = async (password, opts = {})  => {

        let { name = "", address, privateKey, index = 0, imported} = opts;

        let wallets = await DB.getItem(WALLETS_KEY, true)

        if(wallets == null){
            wallets = {}
        }

        address = getAddress(address)

        let walletInfo = {
            address, 
            privateKey
        }

        password = toValue(password)
        
        let encryptedWallet = await Crypt.encrypt(password, walletInfo)

        let dataToSave = {
            name, 
            wallet: encryptedWallet,
            index, 
            imported
        }

        let key = address.toLowerCase().substring(2);

        wallets[key] = dataToSave

        await DB.setItem(WALLETS_KEY, wallets, true)
 
        return Status.successPromise()
    }

    return {
        getDefaultWallet,
        resetWallets,
        hasDefaultWallet,
        saveDefaultWallet,
        saveWallet,
        getWallets
    }
}