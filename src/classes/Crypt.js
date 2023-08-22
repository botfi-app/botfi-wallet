/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */
import SimpleCrypto from "simple-crypto-js"

const enc = (new TextEncoder())
const dec = new TextDecoder();

export default class Crypt {
    
    static toBase64 (buff){
        return btoa(new Uint8Array(buff).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    }
      
    static base64ToBuff(b64){
        return Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));
    }

    static async getPassKey(password, salt, operation) {
    
        const keyMaterial = await window.crypto.subtle.importKey(
                                "raw", 
                                enc.encode(password), 
                                "PBKDF2", 
                                false, 
                                ["deriveKey"]
                            );

      // console.log("keyMaterial===>", keyMaterial)

       return window.crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt,
              iterations: 210_000,
              hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            [operation],
        );
    }


    static async encrypt(password, data){

        const salt = window.crypto.getRandomValues(new Uint8Array(16));

        const key = await this.getPassKey(password, salt, "encrypt")
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        let d = JSON.stringify({ d: data })

        let encData = enc.encode(d)

        let encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encData);

        
        const encryptedArr = new Uint8Array(encrypted);
        let buff = new Uint8Array(salt.byteLength + iv.byteLength + encryptedArr.byteLength);
        
        buff.set(salt, 0);
        buff.set(iv, salt.byteLength);
        buff.set(encryptedArr, salt.byteLength + iv.byteLength);
    
       return this.toBase64(buff);
    }

    static async decrypt(password, encryptedData) {

        const encryptedDataBuff = this.base64ToBuff(encryptedData);
        const salt = encryptedDataBuff.slice(0, 16);
        const iv = encryptedDataBuff.slice(16, 16 + 12);
        const ciphertext = encryptedDataBuff.slice(16 + 12);

        const key = await this.getPassKey(password, salt, "decrypt")

        let result = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

        let dec = new TextDecoder()

        let dataJsonStr = dec.decode(result)

        return (JSON.parse(dataJsonStr)).d
    }

}