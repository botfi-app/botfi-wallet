
import Status from "./Status"
import appConfig from "../config/app"
import Utils from "./Utils"
import fetchJsonp from "fetch-jsonp"

export default class Http {

    /**
     * http get
     * @param {string} url 
     * @param {Object} data 
     * @param {Object} headers 
     */
    static async get(url,data = {}, headers = {}, fetchOpts={}){
        url += (url.indexOf('?') === -1 ? '?' : '&') + this.queryParams(data);
        return this.request(url,{ headers, ...fetchOpts })
    } //end fun

    /**
     * @param {*} uri 
     * @param {*} data 
     * @param {*} hasAuth 
     */
    static async requestApi( method, uri, data={}){

        let headers = {"x-key": appConfig.apiKey, "localtonet-skip-warning": 1}


        let apiEndpoint = appConfig.server_url
                            .replace(/(\/+)$/, "")
        uri = uri.replace(/^(\/+)/, "")

        let url = `${apiEndpoint}/${uri}`;

        //console.log("url==>", url)
        
        try {

            let reqStatus = await ((method == "post") ? this.post(url, data, headers) : this.get(url, data, headers))

            if(reqStatus.isError()) return reqStatus

            let responseObj = reqStatus.getData()

            let respBody =  (await responseObj.text() || "").trim();

            let respJson = (respBody.length ==  0) ? {} : JSON.parse(respBody)

            let statusMsg = respJson.message || ""

            if(statusMsg.toLowerCase() == "system_busy"){
                respJson.message = Utils.generalErrorMsg
            }
            
            if("type" in respJson && "data" in respJson){ 
                return Promise.resolve(Status.newStatus(respJson))
            }


            return Status.successPromise("", respJson)

        } catch (e) {
            console.error(`requestApi Error: ${url}`,e)
            return Status.errorPromise(Utils.generalErrorMsg)
        }
            
    }


    static async getApi(uri, data={}, requiresAuth = false){
        return  this.requestApi("get", uri, data, requiresAuth);
    }


    static async postApi(uri, data={}, requiresAuth = false){
        return  this.requestApi("post", uri, data, requiresAuth);
    }

    /**
     * getJson
     * @param {*} url 
     * @param {*} data 
     * @param {*} headers 
     */
    static async getJson(url, data = {}, headers = {}, fetchOpts={}){
        try {

            headers["Content-Type"] = "application/json"
            
            let reqStatus = await this.get(url,data,headers, fetchOpts)

            if(reqStatus.isError()) return reqStatus

            let responseObj = reqStatus.getData()

            //console.log("responseObj===>>>", responseObj)

            let respBody =  (await responseObj.text()).trim();

            //console.log("url===>", url)
            //console.log("respBody===>", respBody)

            let respJson = (respBody.length ==  0) ? {} : JSON.parse(respBody)

            return Status.successPromise(null, respJson)

        } catch (e) {
            console.error(`getJson Error: ${url}`,e)
            return Status.errorPromise("REQUEST_FAILED",e)
        }
    } //end fun

    static async getJSONP(url, opts={}){
        try {


            let rparams = {
                ...{
                    "credentials":  'omit',
                    "redirect":     "follow",
                    //mode:           "no-cors"
                },
                ...opts
            }

            let response = await fetchJsonp(url)

            let resultJson = await response.json()

            return Status.success("", resultJson)
        } catch (e) {
            console.error(`getJSONP Error: ${url}`,e)
            return Status.errorPromise("REQUEST_FAILED",e)
        }
    } //end fun


    /**
     * http post
     * @param {*} url 
     * @param {*} data 
     * @param {*} headers 
     */
    static async post(url,data = {}, headers = {}, fetchOpts={}){

        //let formData = new FormData()
        let formData = new URLSearchParams(data)
      
        return this.request(url,{
            method: "POST",
            body: formData,
            headers,
            ...fetchOpts
        })
    } //end fun 

    /**
     * queryParams
     * @param {*} params 
     */
    static queryParams(params) {
       let ec = encodeURIComponent;
        return Object.keys(params).map(k => ec(k) + '=' + ec(params[k])).join('&');
    }

    /**
     * request
     * @param {*} url 
     * @param {*} params 
     */
    static async request(url,params){

        let rparams = {
            ...{
                "credentials":  'omit',
                "redirect":     "follow",
                //mode:           "no-cors"
            },
            ...params
        }

        try {

            let response = await window.fetch(url,rparams);

            return Status.successPromise(null, response)

        } catch(e){

            console.error(`request Error: ${url}`,e)
            return Status.errorPromise("REQUEST_FAILED")
        }
    } //end 

 }
