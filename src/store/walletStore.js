/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject, onBeforeMount } from 'vue'
import Status from '../classes/Status';
import Wallet from '../classes/Wallet';
import { useKeystore } from '../composables/useKeyStore';
import { useSimpleDB } from '../composables/useSimpleDB';
import { useNetworks } from '../composables/useNetworks';
import EventBus from '../classes/EventBus';

export const useWalletStore = defineStore('walletStore', () => {

    const ACTIVE_WALLET_ADDR = '_active_wallet_addr'

    const botUtils = inject("botUtils")
    const keyStore = useKeystore()
    const DB = useSimpleDB()
    const networks = useNetworks()

    const defaultState = {
        walletCore:             null,
        password:               "",
        defaultWallet:          null,
        wallets:                [],
        activeWalletAddr:      null
    }

    const $state = ref(defaultState); 


    const defaultWallet          = computed(()       =>    $state.value.defaultWallet )
    const wallets                = computed(()       =>    $state.value.wallets )
    const password               = computed(()       =>    $state.value.password )
    const activeWallet           = computed(()       =>    getWalletByAddr($state.value.activeWalletAddr))
    const lastChildWalletIndex   = computed(()       =>    defaultWallet.lastIndex)
    

    const processPassword = (_pass="") => {

        _pass = toValue(_pass).toString().trim()

        if(_pass == '' ) return _pass
        
        return `${botUtils.getUid()}_${_pass}`
    }

    const setPassword = (pass) => {
        $state.value.password = processPassword(pass)
    }
    
    const getPassword = async () => {
        return password.value.toString().trim()
    }
    
    const doLogin = async (pass) => {
        
        let $s = $state.value

        let _password = processPassword(pass)

        let defaultWalletStatus = await keyStore.getDefaultWallet(_password)
        
        if(defaultWalletStatus.isError()){

            let errMsg = defaultWalletStatus.getMessage()

            if(errMsg == 'wallet_decryption_failed'){
                return Status.errorPromise("Failed to decrypt wallet, check password")
            }

            return defaultWalletStatus
        }

        $s.defaultWallet = defaultWalletStatus.getData()

        // lets now fetch the accounts
        let accountsStatus = await keyStore.getWallets(_password)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        $s.wallets = accountsStatus.getData()
        $s.password = _password

        await getActiveWalletInfo()
        
        EventBus.emit("login")

        return Status.successPromise()
    } //end do login 

    const getWalletByAddr =  (addr) => {
        let idx;
        let w = wallets.value

        for(let i in w){ 
            if(w[i].address == addr){
                idx = i; 
                break; 
            }
        }
        
        return (!idx) ? null : w[idx]
    }

    const setActiveWallet = async (addr) => {
        let $s = $state.value
        $s.activeWalletAddr = addr 
        await DB.setItem(ACTIVE_WALLET_ADDR, addr)
        return Status.success()
    }


    const getActiveWalletInfo = async () => {
        
        let $s = $state.value 

        //console.log("$s ===>", $s )
        
        if($s.activeWalletAddr == null){

            let addr = (await DB.getItem(ACTIVE_WALLET_ADDR)) || null 
            
            if(addr == null) {
                
                let lastWallet = wallets.value.at(-1) || null 
                
                if(lastWallet != null){
                    addr = lastWallet.address;
                }
            }

            if(addr == null) return null;
            
            await DB.setItem(ACTIVE_WALLET_ADDR, addr )

           $s.activeWalletAddr = addr
        }

        //console.log("$s.activeWalletAddr", $s.activeWalletAddr)
        
        return getWalletByAddr($s.activeWalletAddr)
    }
 
    const isLoggedIn = () => {
        return (password.value != '' && 
            defaultWallet.value != null && 
            Object.keys(wallets.value).length > 0
        )
    }

    const logout = () => {
        $state.value = {
            password: '',
            defaultWallet: null,
            wallets: {},
        }

       return Status.success()
    }

    const hasDefaultWallet = async () => {
        return keyStore.hasDefaultWallet()
    }

    const saveDefaultWallet = async (_walletInfo) => {

        let saveStatus = await keyStore.saveDefaultWallet(
                            password.value, 
                            toRaw(_walletInfo)
                        )

        if(saveStatus.isError()){
            return saveStatus
        }

        $state.value.defaultWallet = saveStatus.getData()
       
        await updateWallets();
        await getActiveWalletInfo()

        return saveStatus
    }

    const updateWallets = async () => {

        if(password.value == '') return;

        let walletsStatus = await keyStore.getWallets(password.value)

        if(walletsStatus.isError()){
            return walletsStatus
        }

        $state.value.wallets =  walletsStatus.getData() || []

        return walletsStatus
    }
    
    const getWalletAddresses = async () => {
       await updateWallets()
       return $state.value.wallets.map(item => item.address)
    }
    
    const resetWallets = async () => {

        await keyStore.resetWallets()
        
        await DB.removeItem(ACTIVE_WALLET_ADDR)
        
        await networks.clearNetworks()

        $state.value = defaultState

        return Status.success()
    }

    const deriveChildWallet = async (walletName) => {

        let $s = $state.value;

        let resultStatus = await keyStore.deriveChildWallet(
                            password.value, 
                            walletName
                        )

        if(resultStatus.isError()){
            return resultStatus
        }

        $s.defaultWallet = resultStatus.getData()

        await updateWallets()

        return resultStatus;
    }

    const removeWallet  = async (addr) => {

        let $s = $state.value

        //lets get the item obj
        let item = getWalletByAddr(addr)

        if(item == null){
            return Status.error("Wallet not found")
        }

        if($s.activeWalletAddr == addr){
            return Status.error("Cannot remove active wallet")
        }

        if(!item.imported && item.wIndex == 0){
            return Status.error("Default wallet cannot be removed")
        }

        let removeStatus = await keyStore.removeWallet(addr)

        if(!removeStatus.isError()){
            await updateWallets()
        }

        return removeStatus
    }

    const updateWalletName = async (addr, newName) => {

        //lets get the item obj
        let item = getWalletByAddr(addr)

        if(item == null){
            return Status.error("Wallet not found")
        }

        let removeStatus = await keyStore.updateWalletName(addr, newName)

        if(!removeStatus.isError()){
            await updateWallets()
        }

        return removeStatus
    }

    const decryptPrivateKey = async (addr, password) => {
        
        password = toValue(password).trim()

        if(password == ""){
            return Status.error("Pin code is required")
        }

        let pass = processPassword(password)

        //lets get the item obj
        let item = getWalletByAddr(addr)

        if(item == null){
            return Status.error("Wallet not found")
        }
        
        //console.log("item===>", item)

        return keyStore.decryptWallet(item, pass)
    }


    // import private key 
    const importWalletFromPrivateKey = async (name, privateKey) => {
        
        let resultStatus = await keyStore.importWalletFromPrivateKey( 
                                name, 
                                password.value,
                                privateKey
                            )

        if(!resultStatus.isError()){
            await updateWallets()
        }

        return resultStatus
    }

    const getWeb3Conn = async () => {

        let currentWallet = await getActiveWalletInfo()

        if(!isLoggedIn()){
            return Status.error("Wallet Connection Required")
        }

        let decryptedPkStatus = await keyStore.decryptWallet(currentWallet, password.value)

        if(decryptedPkStatus.isError()){
            return decryptedPkStatus
        }

        let decryptedWallet = decryptedPkStatus.getData()

        //console.log("pk===>", decryptedWallet)

        let connStatus = await networks.getWeb3Conn()

        if(connStatus.isError()){
            return connStatus
        }

        let web3Conn = connStatus.getData()

        let setWalletStatus = web3Conn.setWallet(decryptedWallet.decryptedPk)

        if(setWalletStatus.isError()){
            return setWalletStatus
        }

        return Status.successData(web3Conn)
    }

    return {
        hasDefaultWallet,
        updateWallets,
        wallets,
        defaultWallet,
        saveDefaultWallet,
        setActiveWallet,
        activeWallet,
        getActiveWalletInfo,
        getPassword,
        setPassword,
        doLogin,
        isLoggedIn,
        resetWallets,
        logout,
        deriveChildWallet,
        lastChildWalletIndex,
        removeWallet,
        updateWalletName,
        decryptPrivateKey,
        importWalletFromPrivateKey,
        getWalletAddresses,
        getWeb3Conn
    }
})