import { defineStore } from 'pinia'
import {ref, computed, toValue, toRaw, inject } from 'vue'
import Status from '../classes/Status';
import Wallet from '../classes/Wallet';
import KeyStore from '../classes/keyStore';


export const useWalletStore = defineStore('walletStore', () => {

    const botUtils = inject("botUtils")

    const defaultState = {
        walletCore:             null,
        password:               "",
        defaultWallet:          null,
        wallets:                {},
        activeWallet:           null,
        userActiveNetwork:      null,
        userNetworkInfo:        null,
        defaultNetworkInfo:     null
    }

    const $state = ref(defaultState); 


    const defaultWallet     = computed(()       =>    $state.value.defaultWallet )
    const wallets           = computed(()       =>    $state.value.wallets )
    const password          = computed(()       =>    $state.value.password )
    const processedPass     = computed(()       =>    processPassword($state.value.password) )
    const activeWallet      = computed(()       =>    $state.value.activeWallet)
    const activeWalletFull  = computed(()       =>    '0x' + $state.value.activeWallet)
    const userActiveNetwork   = computed(()     =>     $state.value.userActiveNetwork)
    
    const setState = (key, value) => $state.value[key] = value

    const setPassword = (pass) => {
        setState("password", pass)
    }

    const getUserInfo = () => {
        return botUtils.getUserInfo()
    }
    
    const processPassword = (_pass="") => {

        _pass = toValue(_pass).toString().trim()

        //console.log("_pass===>2", _pass)

        if(_pass == '' ) return _pass
        
        let userInfo = botUtils.getUserInfo()

        if(userInfo == null) return _pass

        return `${botUtils.botPlatform}_${userInfo.id}_${_pass}`
    }

    const getPassword = async () => {
        return password.value.toString().trim()
    }
    
    const doLogin = async (pass) => {
        
        let _ppass = processPassword(pass)

        let uid = botUtils.getUid()

        let defaultWalletStatus = await KeyStore.getDefaultWallet(uid, _ppass)
        
        if(defaultWalletStatus.isError()){

            let errMsg = defaultWalletStatus.getMessage()

            if(errMsg == 'wallet_decryption_failed'){
                return Status.errorPromise("Failed to decrypt wallet, check password")
            }

            return defaultWalletStatus
        }

        setState("defaultWallet", defaultWalletStatus.getData())

        // lets now fetch the accounts
        let accountsStatus = await KeyStore.getWallets(uid, _ppass)

        if(accountsStatus.isError()){
            return accountsStatus
        }

        setState("wallets", accountsStatus.getData());
        setState("password", pass)

        getActiveWalletInfo()
      
        return Status.successPromise()
    } //end do login 


    const getActiveWalletKey = () => {
        let uid = botUtils.getUid()
        return `${uid}_active_wallet`
    }

    const setActiveWallet = (addr) => {

        addr = addr.toLowerCase()

        if(addr.startsWith("0x")) addr = addr.substring(2)

        setState('activeWallet', addr)

        localStorage.setItem(getActiveWalletKey(), addr)
    }

    const getActiveWalletInfo = () => {
        
        let _swalletAddr = activeWallet.value || ""
        
        if(_swalletAddr.length == ''){
            _swalletAddr = localStorage.getItem(getActiveWalletKey()) || ''
        }

        if(_swalletAddr == ''){
            _swalletAddr = Object.keys(wallets.value)[0]
        }

        if(_swalletAddr.startsWith("0x")){
            _swalletAddr = _swalletAddr.substring(2)
        }

        _swalletAddr = _swalletAddr.toLowerCase()

        let w = wallets.value[_swalletAddr];

       setActiveWallet( w.wallet.address )

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

    const hasDefaultWallet = () => {
        return KeyStore.hasDefaultWallet(botUtils.getUid())
    }

    const saveDefaultWallet = async (_walletInfo) => {
        
        let uid = botUtils.getUid()

        let saveStatus = await KeyStore.saveDefaultWallet(
                            uid,
                            processPassword(password), 
                            toRaw(_walletInfo)
                        )

        if(saveStatus.isError()){
            return saveStatus
        }

        setState("defaultWallet", saveStatus.getData())
        updateAccounts();

        return saveStatus
    }

    const updateAccounts = async () => {
        
        let pass = processPassword(toValue(password))

        if(pass == "") {
            return Status.error("Pasword is required")
        }

        let uid = botUtils.getUid()

        let walletsStatus = await KeyStore.getWallets(uid, toValue(pass))

        if(walletsStatus.isError()){
            return walletsStatus
        }

        setState("wallets", walletsStatus.getData())

        return walletsStatus
    }

    const resetWallets = async () => {

        let uid = botUtils.getUid()

        await KeyStore.resetWallets(uid)
        
        localStorage.removeItem(getActiveWalletKey())
        localStorage.removeItem( getUserNetsKey() )

        $state.value = defaultState

        return Status.success()
    }

    const getUserNetsKey = () => {
        let uid = botUtils.getUid()
        return `${uid}_user_networks`
    }

    const fetchDefaultNetworks = async (force=false) => {

        let $s = $state.value

        if(!force && $s.defaultNetworkInfo != null) {
            return $s.defaultNetworkInfo
        }

        let results = await import(`/data/networks.js?url=1&r=${Date.now()}`)
           
        let data = results.default;

        $s.defaultNetworkInfo = data;

        return data
    }

    const getUserNetworks = async () => {

        let key = getUserNetsKey()
        let $s  = $state.value

        if($s.userNetworkInfo != null) {
            return $s.userNetworkInfo
        }

       // console.log("Hmmm===>>>")
       
        let userNetworksStr = (localStorage.getItem(key) || "").trim()
        let userNetworkInfo;

        if(userNetworksStr != ''){
           userNetworkInfo = JSON.parse(userNetworksStr)
        } else {
            userNetworkInfo = await fetchDefaultNetworks(true)
            localStorage.setItem(key, JSON.stringify(userNetworkInfo))
        }

        //console.log("userNetworkInfo===>", userNetworkInfo)

        $s.userNetworkInfo   = userNetworkInfo
        $s.userActiveNetwork = userNetworkInfo.networks[userNetworkInfo.default]

        return userNetworkInfo
    }

    const setActiveNetwork = async (chainId) => {
        
        let $s = $state.value;
        let walletCore = new Wallet()

        //walletInfo 
        let walletInfo = await getActiveWalletInfo()

        let userNeworkInfo = await getUserNetworks()

        let netInfo = userNeworkInfo.networks[chainId]

        let connectStatus = await walletCore.connect(
                                netInfo,
                                walletInfo.wallet.privateKey 
                            )

        if(connectStatus.isError()) {
            return connectStatus
        }

        userNeworkInfo.default = chainId

        localStorage.setItem(getUserNetsKey(), JSON.stringify(userNeworkInfo))

        $s.userNetworkInfo = userNeworkInfo
        $s.userActiveNetwork =  netInfo

        return Status.success()
    }

    const removeNetwork = async (chainId) => {

        let $s = $state.value;

        if(chainId == 1){
            return Status.error("Cannot delete this network")
        }

        let userNeworkInfo = await getUserNetworks()

        delete userNeworkInfo.networks[chainId]

        if(userNeworkInfo.default == chainId){
            userNeworkInfo.default = 1
        }

        localStorage.setItem(getUserNetsKey(), JSON.stringify(userNeworkInfo))

        $s.userNetworkInfo = userNeworkInfo
        $s.userActiveNetwork =  userNeworkInfo.networks[userNeworkInfo.default]

        return Status.successData(userNeworkInfo)
    }

    const resetNetworks = async () => {
        
        let $s = $state.value;
        $s.userNetworkInfo = null;
        $s.userActiveNetwork = null

        let key = getUserNetsKey()

        localStorage.removeItem( key )
    
        let userNetworkInfo = await fetchDefaultNetworks(true)
        
        localStorage.setItem(key, JSON.stringify(userNetworkInfo))

        $s.userNetworkInfo = userNetworkInfo
        $s.userActiveNetwork =  userNetworkInfo.networks[userNetworkInfo.default]

        return Status.successData(userNetworkInfo)
    }

    const fetchNetworkInfo = async (rpc) => {

        let walletCore = new Wallet()

        //walletInfo 
        //let walletInfo = await getActiveWalletInfo()
        
        let connectStatus = await walletCore.connect(
                                {rpc: [rpc] }
                            )

        if(connectStatus.isError()) {
            return connectStatus
        }

        return walletCore.getNetwork()
    }

    const saveNetwork = async (netInfo, setDefault=false) => {

        $s = $state.value;

        let userNeworkInfo = await getUserNetworks()

        let networks = userNeworkInfo.networks

        networks[netInfo.chainId] = netInfo;

        $s.userNetworkInfo = networks

        if(setDefault){
            userNeworkInfo.default = netInfo.chainId
            $s.userActiveNetwork = netInfo
        }

        return Status.success()
    }

    return {
        hasDefaultWallet,
        updateAccounts,
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
        logout,
        getUserNetworks,
        fetchDefaultNetworks,
        setActiveNetwork,
        userActiveNetwork,
        removeNetwork,
        resetNetworks,
        fetchNetworkInfo,
        saveNetwork
    }
})