/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 */

 /* 
 * The status Class responsible for handling Status of any activity
 * @class
 * @exports
 * @typedef {Status}
 */
export default class Status {
    /**
     * @type {string} status type, which is error, info & success
     * @access private
     */
    type = "";

    /**
     * @type {string|null} status message
     * @access private
     */
    msg = "";

    /**
     * @type {any|null} data accompanying the status
     * @access private 
     */
    data = null;

    /**
     * @type {number|null} status code
     * @access private
     */
    code = null;

    codeText = null;

    /**
     * build the status object, mostly used internally
     * @param {string} type 
     * @param {string} msg 
     * @param {any|null} data 
     * @access private
     * @returns {Status}
     */
    buildStatus(type, msg, data) {
        this.type = type;
        this.msg  = msg;
        this.data = data;
        return this;
    }

    /**
     * is the current status an error
     * @returns {boolean}
     */
    isError() {
        return this.type == "error";
    }

    /**
     * is the current status an info
     * @returns {boolean}
     */
    isSuccess() {
        return this.type == "success"; 
    }

    /**
     * get the current status type
     * @returns {string}
     */
    getType() {
        return this.type;
    }

    /**
     * get the current status data 
     * @returns {any|null}
     */
    getData(){ return this.data; }

    /**
     * get the current status message 
     * @returns {string|null}
     */
    getMessage(){
        return this.msg;
    }

    /**
     * set the status code 
     * @param {number|null} 
     * @returns {Status}
     */
    setCode(code){
        this.code = code;
        return this;
    }

    setCodeText(text) {
        this.codeText = text;
        return this;
    }

    getCodeText(){ 
        return this.codeText;
    }

    /**
     * get the current status message 
     * @returns {number|null}
     */
    getCode(){
        return this.code;
    }

    /**
     * set success status
     * @param {string} msg 
     * @param {any|null} data 
     * @alias
     * @returns {Status}
     */
    static success(msg, data = null) {
        return (new Status()).buildStatus("success",msg,data)
    }

    /**
     * set success status which accepts only data
     * @param {any|null} data 
     * @alias
     * @returns {Status}
     */
    static successData(data) {
        return (new Status()).buildStatus("success","",data)
    }

    /**
     * set success status which returns a promise
     * @param {string} msg 
     * @param {any|null} data 
     * @alias
     * @returns {Promise<Status>}
     */
    static async successPromise(msg, data = null) {
        return Promise.resolve((new Status()).buildStatus("success",msg,data))
    }

    /**
     * set error status
     * @param {string} msg 
     * @param {any|null} data 
     * @alias
     * @returns {Status}
     */
    static error(msg, data = null) {
        return (new Status()).buildStatus("error",msg,data)
    }


    /**
     * set error status which returns a promise
     * @param {string} msg 
     * @param {any|null} data 
     * @alias
     * @returns {Promise<Status>}
     */
    static async errorPromise(msg, data = null) {
        return Promise.resolve((new Status()).buildStatus("error",msg,data))
    }

     /**
     * set info status
     * @param {string} msg 
     * @param {any|null} data 
     * @alias
     * @returns {Status}
     */
    static info(msg, data = null) {
        return (new Status()).buildStatus("info",msg,data)
    }

    static newStatus(opts){
        return (new Status()).buildStatus(opts.type,opts.message || "", opts.data || null)
    }
}
