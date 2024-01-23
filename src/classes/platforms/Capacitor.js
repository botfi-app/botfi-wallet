/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */
import { Preferences as sharedPerf } from '@capacitor/preferences';
import { Clipboard } from '@capacitor/clipboard';
import {
    BarcodeScanner,
    BarcodeFormat,
    LensFacing,
  } from '@capacitor-mlkit/barcode-scanning';

export default class Capacitor {

    botPlatform = "capacitor"
    router = null

    constructor(router) {
        this.router = router
    }
   
    // get account 
    getUserInfo() {
        return {
            id: "", 
            username: "",
            firstName: "",
            lastName: ""
        }
    }

    getUid() {
        return `${this.botPlatform}`
    }

    notSupported() {
        return { isSupported: () => false }
    }

    getViewportHeight() {
        return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }

    isExpanded  = () => true

    platform() {
        return this.platform
    }

    backBtn = (onClick = null) => this.notSupported()

    DB = () => ({
        setItem: async (key, value) => sharedPerf.set({key, value}),
        getItem: async (key) => (await sharedPerf.get({ key })).value,
        removeItem: async (key) => sharedPerf.remove({ key }),
    })

    clipboard() {

        let isSupported =  true

        return {
            isSupported: () => isSupported,
            readText: (callback) => Clipboard.read().then((type, value) => callback(value))
        }
    }
    
    qrCodeReader() {

        const startScan = async () => {
         
            document.body.classList.add("qrscanner"); // add the qrscanner class to body

            /// Add the `barcodeScanned` listener
            await BarcodeScanner.addListener('barcodeScanned',async (result) => {
                callback(result.barcode);
                stopScan()
            });

            // Start the barcode scanner
            await BarcodeScanner.startScan();

            await stopScan()
        }

        const stopScan = async () => {
            document.body.classList.remove("qrscanner"); // remove the qrscanner from the body 
            await BarcodeScanner.removeAllListeners();
            BarcodeScanner.stopScan();
        };
   
        return {
            isSupported: () => false,
            show: (title, callback) => {
                startScan(callback)
            },
            getInstance: BarcodeScanner,            
            close: () => stopScan()
        }
    }

}