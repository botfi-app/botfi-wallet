import browser from "."

export default (tabId) => {

    let maxRequestWaitTime = browser.maxRequestWaitTime || 10_000;

    return `(function(){

        const mc = window.botfi_msg_channel;
        const tabId = "${tabId}"
        
        //message requests data 
        const msgRequests = {}

        // registered events 
        const registeredEvents = {}

        /// send message to app
        const sendMessage = async (message, waitForReply=false) => {
            
            const requestId = crypto.randomUUID();

            if(waitForReply){
                msgRequests[requestId] = null
            }

            let origin = window.location.origin;

            let dataToSend = JSON.stringify({
                requestData: message,
                requestId,
                requiresReply: waitForReply,
                origin,
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

                        let _reply = msgRequests[requestId];

                        if(_reply != null){
                           return resolve(_reply)
                        }

                        // after 30s, lets just return null
                        waitCount += timeIntval

                        if(waitCount == ${maxRequestWaitTime}){
                            reject(new Error("REQUEST_TAKING_TOO_LONG"))
                        }

                    }, timeIntval)
               }));
            }

            return null
        }

        // listen to incoming messages 
        window.addEventListener("message", (opts) => {
            
            const { 
                requestId = "", 
                msgType="", 
                origin, 
                data = null 
            } = opts; 

            if(msgType == "callback"){
                if(window.location.origin != origin || !(requestId in msgRequests)) return;
                msgRequests[requestId] = data
                return true;
            }

            else if(msgType == "event" && data != null) {
                let { eventName = "", eventData = null } = data
                
                if(eventName == null) return true;

                registeredEvents[eventName].forEach(callbackFunc => {
                    if(typeof callbackFunc == 'function'){
                        callbackFunc(eventData)
                    }
                })
            }
        })

        window.ethereum = {
            request: async ({ method, params = [] }) => {
                let message = { method, params, action: "network_request" }
                return sendMessage(message, true)
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