import browser from "."

export default (tabId) => {

    let maxRequestWaitTime = browser.maxRequestWaitTime || 30_000;

    return `(function(){

        const mc = window.botfi_msg_channel;
        const tabId = "${tabId}"
        
        //message requests data 
        const msgRequests = {}

        // registered events 
        const registeredEvents = {}

        // on loaded, lets send the title and url
        window.addEventListener("load", () => {
            const sendPageInfo = () => {
                sendMessage({ 
                    method: "webpageInfoUpdate",
                    params: [{ 
                        tabId,
                        title: document.title, 
                        url: window.location.href 
                    }]
                }, false)
            }

            sendPageInfo()
        })

        /// send message to app
        const sendMessage = async (message, waitForReply=false) => {
            
            const requestId = crypto.randomUUID();

            if(waitForReply){
                msgRequests[requestId] = null
            }

            let dataToSend = JSON.stringify({
                requestData: message,
                requestId,
                requiresReply: waitForReply,
                tabId
            });
            
            mc.postMessage(dataToSend) 

            let reply = null

            if(waitForReply) {

                let waitCount = 0;
                let timeIntval = 500;
                let timeToWait = 180_000; // 3minutes 

                return (new Promise((resolve, reject) => {
                    let intval = setInterval(() => {

                        let _replyStatus = msgRequests[requestId];

                        if(_replyStatus != null){
                            clearInterval(intval)
                           if(_replyStatus.type == "success"){
                              return resolve(_replyStatus.data)
                           } else {

                            let err = new Error(_replyStatus.msg)
                            err.code = _replyStatus.code || null

                             return reject(err)
                           }
                        }

                        // after 30s, lets just return null
                        waitCount += timeIntval

                        if(waitCount == ${maxRequestWaitTime}){
                            clearInterval(intval)
                            reject(new Error("REQUEST_TAKING_TOO_LONG"))
                        }

                    }, timeIntval)
               }));
            }

            return null
        }

        // listen to incoming messages 
        window.addEventListener("message", (e) => {

            let msgObj = e.data

            if(msgObj == "") return;

            try{
                msgObj = JSON.parse(msgObj)
            } catch(e){ 
                return false;
            }
            
            const { 
                requestId = "", 
                msgType="", 
                origin, 
                data = null 
            } = msgObj; 

            if(msgType == "callback"){
                if(location.origin != origin || !(requestId in msgRequests)) return;
                msgRequests[requestId] = data
                return true;
            }

            else if(msgType == "event" && data != null) {
                let { eventName = "", eventData = null } = data
                
                if(eventName.trim() == "") return true;

                registeredEvents[eventName].forEach(callbackFunc => {
                    if(typeof callbackFunc == 'function'){
                        callbackFunc(eventData)
                    }
                })
            }
        })

        window.ethereum = {
            request: async ({ method, params = [] }) => {
                return sendMessage({ 
                    method, 
                    params, 
                    action: "network_request" 
                }, true)
            },
            
            on: (eventName, callback = null) => {
                if(eventName in registeredEvents){
                    registeredEvents[eventName].push(callback)
                } else {
                    registeredEvents[eventName] = [callback]
                }
            }
        }

    })();`
}