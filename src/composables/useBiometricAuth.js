/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */


import Utils from '../classes/Utils';
import { NativeBiometric } from "capacitor-native-biometric";
import { useSimpleDB } from './useSimpleDB';
import Status from '../classes/Status';

export const useBiometricAuth =  () => {

    const sDB = useSimpleDB()
    const bAuthKey = "app.botfi.app.auth_password"

    const isSupported = async () => {
        try{
            let info = await NativeBiometric.isAvailable()
            return (Utils.isPlatform("capacitor") && info.isAvailable)
        } catch(e){
            Utils.logError("",e)
            return false
        }
    }

    const setCredential = async ({ key, username, password }) => {
        try {   
            
            let params = {
                username, 
                password,
                server: key
            }

            //console.log("params ===>", params)

            let result = await NativeBiometric.setCredentials(params)

            //console.log("setCredo Result===>", result)

            return Status.success()
        } catch(e){
            Utils.logError("useBiometricAuth#setCredential:", e)
            return Status.error("Failed to set biometric credentials")
        }
    }

    const verifyBiometric = async () => {
        try {
            const verified = await NativeBiometric.verifyIdentity({
                reason: "Authenticate to unlock wallet",
                title: "Authentication",
                subtitle: "Please authenticate to unlock your wallet",
                description: "",
            })

            return verified
        } catch(e){
            Utils.logError("useBiometricAuth#setCredential:", e)
            return false
        }
    }

    const getCredential = async (key) => {

        try {

            let data = await NativeBiometric.getCredentials({ server: key })
            return Status.successData(data)
        } catch(e){
            Utils.logError("useBiometricAuth#getCredential:", e)
            return Status.error("Failed to get credentials")
        }
    } 


    const enableBiometricAuth = async (password) => {

        password = password.toString()

        try {
            if(!(await isSupported())) return;

            let result =  await setCredential({ 
                username: "botfi_wallet_user",
                password, key: 
                bAuthKey 
            })

            //console.log("result===>", result)

            await sDB.setItem("biometric_auth_enabled", true)
        } catch(e){
            Utils.logError("useBiometricAuth#enableBiometricAuth:", e)
            return false
        }
    }

    const clearBiometricAuth = async () => {
        try {

            await sDB.removeItem("biometric_auth_enabled")
            await deleteCredential(bAuthKey)

            return Status.success()
        } catch(e){
            Utils.logError("useBiometricAuth#clearBiometricAuth:", e)
            return Status.error("Failed to clear biometric credentials")
        }
    }

    const deleteCredential = async (key) => {
        try {

            await NativeBiometric.deleteCredentials({
                server: key,
            })

            return Status.success()

        } catch(e){
            Utils.logError("useBiometricAuth#setCredential:", e)
            return Status.error("Failed to delete biometric credentials")
        }
    }

    const isBiometricAuthEnabled = async () => {
        if(!(await isSupported())) return;
        return (await sDB.getItem("biometric_auth_enabled")) || false 
    }
    
    
    return {
        isSupported,
        setCredential,
        getCredential,
        deleteCredential,
        enableBiometricAuth,
        isBiometricAuthEnabled,
        clearBiometricAuth,
        authServerName: bAuthKey
    }
}