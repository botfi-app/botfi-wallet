
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';
import NativeBackBtn from '../../components/common/NativeBackBtn.vue';
import Image from '../../components/common/Image.vue';
import Icon from '../../components/common/Icon.vue';
import { Modal as bsModal } from 'bootstrap';
import MainBtn from "../../components/common/MainBtn.vue"
import { useRouter } from 'vue-router';

const router = useRouter()
const initialized = ref(false)
const activeNetInfo = ref({})
const allNetworks = ref({})
const walletStore = useWalletStore()
const isLoading   = ref(false)
const modalTitle  = ref("")
const selectedItem = ref(null) 
const modalId = ref('net-opt-modal-'+Date.now())
let _modal = null



const initialize = async () => {

    let userNetworks = await walletStore.getUserNetworks()    
    activeNetInfo.value = userNetworks.networks[userNetworks.default]
    allNetworks.value = userNetworks.networks
    selectedItem.value = userNetworks.networks[1]
    
    initialized.value = true
}

onBeforeMount(() => {
    initialize()
})


const onItemClick = async (item) => {
   
    if(_modal == null){
        _modal = bsModal.getOrCreateInstance('#'+modalId.value)
    }

    selectedItem.value = item 
    modalTitle.value = `<span class='text-primary'>${item.name}</span>`        
    _modal.show()
}

const setDefaultNetwork = async () => {
   
    let loader = Utils.loader("Setting Default Network")
    let resultStatus = await walletStore.setActiveNetwork(selectedItem.value.chainId)
    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }

    _modal.hide()
}

const removeNetwork = async () => {

    let netInfo = selectedItem.value

    if(netInfo.chainId == 1){
        return Utils.errorAlert("Cannot delete this networl")
    }

    let confirm = await Utils.getSwal().fire({
                    title: "Remove Network",
                    text: `Confirm the removal of '${selectedItem.value.chainName}'`,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Confirm"
                })

    if(!confirm.isConfirmed) return false;
    
    let loader = Utils.loader("Removing Network")

    let resultStatus = await walletStore.removeNetwork(netInfo.chainId)

    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }

    let resultData = resultStatus.getData()

    activeNetInfo.value = resultData.networks[resultData.default]
    allNetworks.value   = resultData.networks

    _modal.hide()
}

const resetNetworks = async () => {

    let confirm = await Utils.getSwal().fire({
                    title: "Reset Networks",
                    text: `This will reset the networks to default mode including removal of custom networks`,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Continue"
                })

    if(!confirm.isConfirmed) return false;

    let loader = Utils.loader("Resetting Networks")

    let resultStatus = await walletStore.resetNetworks()

    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }

    let resultData = resultStatus.getData()

    activeNetInfo.value = resultData.networks[resultData.default]
    allNetworks.value   = resultData.networks

    console.log(allNetworks.value)

    _modal.hide()
}
</script>
<template>
    <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="initialized"
    >   

        <NativeBackBtn />

        <div class="w-400">
            
            <loading-view :isLoading="isLoading">
                <div class="d-flex p-2 align-items-center flex-nowrap">
                    <div class="fw-semibold fs-6 pe-2">Networks</div>
                    <div class="flex-grow-1">
                        <search-form 
                            placeholder="Search"
                        />
                    </div>
                    <div class="ps-2">
                        <router-link to="/networks/add" class="no-underline">
                            <button class="btn btn-primary rounded-pill v-center">
                                <Icon name="ion:add-sharp" :size="18" />
                                <div class="px-1">Add</div>
                            </button>
                        </router-link>
                    </div>
                </div>
                <ul class="list-group list-group-flush w-full no-select">
                    <li v-for="(item,index) in allNetworks" 
                        class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        :key="index"
                        role="button" 
                        @click="onItemClick(item)"
                    >
                        <div class="d-flex">
                            <Icon name="clarity:check-line" 
                                :size="24"
                                v-if="walletStore.userActiveNetwork.chainId == item.chainId"
                                class="me-2 text-primary"
                            />
                            <div class="no-select">
                                <div>{{ item.name }} &nbsp;
                                    <span class='fs-12 hint'>{{item.chainId}} </span>
                                </div>
                                
                            </div>
                        </div>
                        <Image 
                            :width="28"
                            :height="28"
                            :src="Utils.getTokenIconUrl(item.shortName)" 
                            alt=""
                            :placeholder="item.shortName.charAt(0)"
                            class="rounded-circle mselect-icon"
                        />
                    </li>
                </ul>
            </loading-view>
        </div>

        <div>
            <MainBtn 
                text="Reset Networks"
                :onClick="resetNetworks"
            />
        </div>
        <modal
            :id="modalId"
            :title="modalTitle"
            :has-header="true"
            :has-footer="false"
            size="modal-sm"
        >
            <template #body>
                <ul class="list-group list-group-flush w-full no-select">
                    <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        role="button"
                        @click.prevent="setDefaultNetwork"
                    >
                        <div>Set as Default</div>
                        <Icon name="clarity:check-line" class='text-primary' :size="24" />
                    </li>
                    <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        role="button"
                    >
                        <div>Edit Network</div>
                        <Icon name="basil:edit-outline" class='text-primary' :size="24" />
                    </li>
                    <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        v-if="selectedItem.chainId != 1"
                        role="button"
                        @click.prevent="removeNetwork"
                    >
                        <div>Remove Network</div>
                        <Icon name="fluent:delete-28-regular" class='text-danger' :size="24" />
                    </li>
                </ul>
            </template>
        </modal>
    </WalletLayout>
</template>
