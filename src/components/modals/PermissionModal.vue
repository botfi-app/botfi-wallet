<script setup>
import { nextTick, ref, watch } from 'vue';
import { Modal as bsModal } from 'bootstrap';
import { usePermission } from "../../composables/usePermission"
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import { useNetworks } from '../../composables/useNetworks';
import { useTx } from '../../composables/useTx';
import { useTokens } from '../../composables/useTokens';


const tokensCore = useTokens()
const txCore = useTx()
const walletStore = useWalletStore()
const netCore = useNetworks()
const { isNetReady, activeNetwork } = netCore

const isLoading = ref(false)
const id = ref("permission_modal")
const title = ref("")
const text  = ref("")
const warningText = ref("")
const extraParams = ref([])
const method = ref(null)
const origin = ref("")

const activeWalletAddr = ref("")
const nativeTokenInfo = ref({})

const emits = defineEmits(["show", "hide"])

const errorMsg = ref("")
const isOpened = ref(null)
const isConfirmed = ref(false)
const isReady = ref(false)
const confirmBtn = ref("")
const txParams = ref()

const decodedContractInfo = ref([])
const parsedTxData = ref(null)

const initialize = async () => {

    try {

        //console.log("txParams.value===>", txParams.value)

        isLoading.value = true

        isReady.value = false

        errorMsg.value = ""

        activeWalletAddr.value = (await walletStore.getActiveWalletInfo()).address;


        if(["eth_sendTransaction"].includes(method.value)){

            // lets get user native balance 
            nativeTokenInfo.value = await tokensCore.getNativeToken()

            console.log("nativeTokenInfo.value===>", nativeTokenInfo.value)

            let txDataObj = txParams.value[0] ||  null

            //lets fetch the tx data 
            if(txDataObj == null){
                return errorMsg.value = "Transaction parameters required"
            }

            let _data = await txCore.decodeTxData(txDataObj)

            if(_data == null) return;

            let infoText = _data.infoText || ""
            let warning = _data.warningText || ""

            let website = (new URL(origin.value)).hostname

            if(infoText != "") {
                infoText = infoText.replace("{{WEBSITE}}", `<strong>${website}</strong>`)
                text.value = infoText
            }

            if(warning != "") warningText.value = warning

            console.log("parsedTxData.value====>", _data)

            let methodInfoArr = []

            methodInfoArr.push({
                name:  "Method",
                value: _data.methodName
            })

            let methodArgs = _data.methodArgs || []

            methodArgs.forEach(item => {

                let argValueStr = item.argValue.toString()

                if("formattedArgValue" in item){
                    argValueStr = item.formattedArgValue
                }

                methodInfoArr.push({
                    name:  item.argName, 
                    value: argValueStr
                })
            })

            decodedContractInfo.value = methodInfoArr
        } //end if eth_sendTransaction

    } catch(e){
        Utils.logError("PermissionModal#initialize:", e)
        errorMsg.value = e.message;
    } finally {
        isLoading.value = false
        isReady.value = true
    }
}


const  show = async (opts={}) => {


    title.value           = opts.title || "";
    text.value            = opts.text || "";
    extraParams.value     = opts.extraParams || [];
    warningText.value     = opts.warningText || "";
    method.value          = opts.method || ""
    txParams.value        = opts.txParams || []  
    origin.value          = opts.origin || ""    
    confirmBtn.value      = opts.confrimBtn || "Confirm"

   
    bsModal.getInstance("#"+id.value).show()

    await initialize()

    return (new Promise((resolve, reject) => {
        let intval = setInterval(() => {
            if(isOpened.value != null && isOpened.value == false){
                
                resolve({
                    isConfirmed: isConfirmed.value,
                    isRejected: !isConfirmed.value
                });

                clearInterval(intval)
            }
        },100)
    }))
}

const  hide = () => {
    nextTick(() =>{
        bsModal.getInstance("#"+id.value).hide()
    })
}


defineExpose({show, hide})

const onShow = () => {
    
    isOpened.value = true 
    
    //confirm btns 
    isConfirmed.value = false

    emits('show')
}

const onHide = () => {
    isOpened.value = false 
    isReady.value = false
    emits('hide')
}

const handleApproveBtn = async () => {
    isConfirmed.value = true 

    hide()
}

const handleRejectBtn = () => {
    isConfirmed.value = false 
    hide()
}
</script>
<template>
    <Modal
        :id="id"
        title=""
        :has-header="false"
        :has-footer="true"
        dialogClass="modal-lg modal-dialog-scrollable modal-dialog-centered  perm-modal"
        :modalOpts="{ backdrop: 'static', keyboard: false }"
        @show="onShow"
        @hide="onHide"
    >   
        <template #body>
            <div class="py-4 px-3 text-center">
                <LoadingView :isLoading="isLoading" loadingText="Loading..">

                    <div class="center-vh">
                        <Icon 
                            name="mynaui:info-hexagon" 
                            class="text-success" 
                            :size="60"
                        />
                    </div>

                    <div class="my-2  my-3" v-if="title != ''">
                        <h2> {{ title }}</h2>
                        <div class="fs-12 muted">{{ origin }}</div>
                    </div>

                    <div v-if="text != ''" 
                        class="my-2 mt-4"
                        v-html="text"
                    />

                    <p v-if="errorMsg != ''" class='p-2 text-danger text-start'>
                        <div class="fw-semibold">Error:</div>
                        {{  errorMsg }}
                    </p>

                    <div v-else>

                        <template v-if="warningText != ''">
                            <div class="d-flex text-start">
                                <div><Icon name="typcn:warning-outline" class="text-danger" :size="24"  /></div>
                                <div class="fs-12 ms-2 text-danger" v-html="warningText"></div>
                            </div>
                        </template>

                        <div class="my-3" v-if="isNetReady">
                            <div class="fs-12 fw-bold muted text-start mb-1">Network</div>
                            <div class="net-select-btn p-3 text-start rounded-lg">
                                <div class="d-flex align-items-center">
                                    <Image 
                                        :width="24" 
                                        :height="24" 
                                        class="rounded-circle shadow"
                                        :src="activeNetwork.icon || ''" 
                                        :placeholder="activeNetwork.chainName"
                                    />
                                    <div class="ps-2 fw-semibold">
                                        {{ activeNetwork.chainName }}
                                    </div>
                                </div>
                                <div class="fs-12 muted">
                                    {{ Utils.maskAddress(activeWalletAddr, 8, 12) }}
                                </div>
                            </div>
                        </div>

                    
                        <template v-if="decodedContractInfo.length > 0">
                            <div>
                                <div class="fs-12 fw-bold muted text-start mb-1 mt-4">
                                    Contract Info
                                </div>
                                <div class="px-3 py-2 bg-darken-5 rounded-lg">
                                    <template v-for="item in decodedContractInfo">
                                        <div class="d-flex justify-content-between align-items-start my-3">
                                            <div class="fs-12 fw-medium text-capitalize pe-4">
                                                {{ item.name }}:
                                            </div>
                                            <div class="fs-12 fw-medium text-break text-end">
                                                {{ item.value }}
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div> 
                        </template>

                    </div>
                </LoadingView>
            </div>
        </template>
        <template #footer>
            <div class="mt-4 center-vh w-full">
                <button class="btn btn-danger p-3 w-full rounded-lg me-2"
                    @click.prevent="handleRejectBtn"
                >
                    Cancel
                </button>
                <button v-if="errorMsg == '' && !isLoading && isReady"
                    class="btn btn-success p-3 w-full rounded-lg"
                    @click.prevent="handleApproveBtn"
                >
                    {{ confirmBtn }}
                </button>
                
            </div>
        </template>
    </Modal>
</template>
<style lang="scss">
    .perm-modal {
        width: 100% !important;
        margin: 10px 0px; 
        padding: 0px;
        .modal-content { margin: 0px !important; padding: 0px !important; }
    }
</style>