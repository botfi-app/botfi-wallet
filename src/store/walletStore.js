import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject } from 'vue'
import Status from '../classes/Status';
import Wallet from '../classes/Wallet';
import { useKeystore } from '../composables/useKeyStore';
import { useDB } from '../composables/useDB';
import { useNetworks } from '../composables/useNetworks';


export const useWalletStore = defineStore('walletStore', () => {

    const ACTIVE_WALLET = '_active_wallet'


    const botUtils = inject("botUtils")
    const keyStore = useKeystore()
    const DB = useDB()
    const networks = useNetworks()

    const defaultState = {
        walletCore:             null,
        password:               "",
        defaultWallet:          null,
        wallets:                {},
        activeWallet:           null
    }

    const $state = ref(defaultState); 


    const defaultWallet     = computed(()       =>    $state.value.defaultWallet )
    const wallets           = computed(()       =>    $state.value.wallets )
    const password          = computed(()       =>    $state.value.password )
    const activeWallet      = computed(()       =>    $state.value.activeWallet)
    const activeWalletFull  = computed(()       =>    '0x' + $state.value.activeWallet)
    
  
    const setState = (key, value) => $state.value[key] = value

    const setPassword = (pass) => {
        setState("password", pass)
    }

    
    const processPassword = (_pass="") => {

        _pass = toValue(_pass).toString().trim()

        if(_pass == '' ) return _pass
        
        return `${botUtils.getUid()}_${_pass}`
    }

    const getPassword = async () => {
        return password.value.toString().trim()
    }
    
    const doLogin = async (pass) => {
        
        let _ppass = processPassword(pass)

        let defaultWalletStatus = await keyStore.getDefaultWallet(_ppass)
        
        if(defaultWalletStatus.isError()){

            let errMsg = defaultWalletStatus.getMessage()

            if(errMsg == 'wallet_decryption_failed'){
                return Status.errorPromise("Failed to decrypt wallet, check password")
            }

            return defaultWalletStatus
        }

        setState("defaultWallet", defaultWalletStatus.getData())

        // lets now fetch the accounts
        let accountsStatus = await keyStore.getWallets(_ppass)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        setState("wallets", accountsStatus.getData());
        setState("password", pass)

        getActiveWalletInfo()
      
        return Status.successPromise()
    } //end do login 



    const setActiveWallet = async (addr) => {
        
        addr = addr.toLowerCase()

        if(addr.startsWith("0x")) addr = addr.substring(2)

        setState('activeWallet', addr)

        await DB.setItem(ACTIVE_WALLET, addr)
    }

    const getActiveWalletInfo = async () => {
        
        let _swalletAddr = activeWallet.value || ""
        
        if(_swalletAddr.length == ''){
            _swalletAddr = (await DB.getItem(ACTIVE_WALLET)) || ''
        }

        if(_swalletAddr == ''){
            _swalletAddr = Object.keys(wallets.value)[0]
        }

        if(_swalletAddr.startsWith("0x")){
            _swalletAddr = _swalletAddr.substring(2)
        }

        _swalletAddr = _swalletAddr.toLowerCase()

        let w = wallets.value[_swalletAddr];

        await setActiveWallet( w.wallet.address )

        return wallets.value[_swalletAddr]
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
                            processPassword(password), 
                            toRaw(_walletInfo)
                        )

        if(saveStatus.isError()){
            return saveStatus
        }

        setState("defaultWallet", saveStatus.getData())
       
        updateWallets();

        return saveStatus
    }

    const updateWallets = async () => {
        
        let pass = processPassword(toValue(password))

        if(pass == "") {
            return Status.error("Pasword is required")
        }

        let walletsStatus = await keyStore.getWallets(toValue(pass))

        if(walletsStatus.isError()){
            return walletsStatus
        }

        setState("wallets", walletsStatus.getData())

        return walletsStatus
    }

    const resetWallets = async () => {

        await keyStore.resetWallets()
        
        await DB.removeItem(ACTIVE_WALLET)
        
        await networks.clearNetworks()

        $state.value = defaultState

        return Status.success()
    }


    return {
        hasDefaultWallet,
        updateWallets,
        wallets,
        defaultWallet,
        saveDefaultWallet,
        setActiveWallet,
        activeWallet,
        activeWalletFull,
        getActiveWalletInfo,
        getPassword,
        setPassword,
        doLogin,
        isLoggedIn,
        resetWallets,
        logout
    }
})