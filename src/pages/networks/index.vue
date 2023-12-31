
<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import WalletLayout from '../../layouts/WalletLayout.vue';
import NativeBackBtn from '../../components/common/NativeBackBtn.vue';
import Image from '../../components/common/Image.vue';
import Icon from '../../components/common/Icon.vue';
import { Modal as bsModal } from 'bootstrap';
import MainBtn from "../../components/common/MainBtn.vue"
import { useRouter } from 'vue-router';
import { useNetworks } from '../../composables/useNetworks';
import Modal from '../../components/modals/Modal.vue';

const net = useNetworks()
const { isNetReady, allNetworks, activeNetwork } = net;
const router = useRouter()
const initialized = ref(false)
const isLoading   = ref(false)
const modalTitle  = ref("")
const selectedItem = ref(null) 
const modalId = ref('net-opt-modal-'+Date.now())
let _modal = null
const dataState = ref(Date.now())
const networksDataToRender = ref({})

const initialize = async () => {
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
   
    //console.log("selectedItem.value===>", selectedItem.value)

    let loader = Utils.loader("Setting Default Network")
    let resultStatus = await net.setActiveNetwork(selectedItem.value.chainId)
    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }
    
    dataState.value = Date.now()

    _modal.hide()
}

const removeNetwork = async () => {

    let _selected = selectedItem.value

    if(_selected.chainId == 1){
        return Utils.errorAlert("Cannot delete this networl")
    }

    let confirm = await Utils.getSwal().fire({
                    title: "Remove Network",
                    text: `Confirm the removal of '${_selected.name} (${_selected.chainId})'`,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Confirm"
                })

    if(!confirm.isConfirmed) return false;
    
    let loader = Utils.loader("Removing Network")

    let resultStatus = await net.removeNetwork(_selected.chainId)

    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }

    dataState.value = Date.now()

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
    //console.log(confirm)

    if(!confirm.isConfirmed) return false;

    let loader = Utils.loader("Resetting Networks")

    let resultStatus = await net.resetNetworks()

    loader.close()

    if(resultStatus.isError()){
        return Utils.mAlert(resultStatus.getMessage())
    }

    dataState.value = Date.now()
    
    if(_modal) _modal.hide()
}

const onEditItemClick  = () => {
    if(_modal) _modal.hide()
    router.push(`/networks/edit?chainId=${selectedItem.value.chainId}`)
}

const onSearch = async (keyword, filteredData) => {
   networksDataToRender.value = filteredData
}
</script>
<template>
    <WalletLayout
        title="Networks"
        :show-nav="false"
        v-if="isNetReady"
    >   

        <NativeBackBtn />

        <div class="w-400 mb-5">
            
            <loading-view :isLoading="isLoading" :key="dataState">
                <div class="d-flex p-2 justify-content-between align-items-center flex-nowrap">
                    <div class="fw-semibold fs-6 pe-2">Networks</div>
                    <div class="ps-2">
                        <router-link to="/networks/add" class="no-underline">
                            <button class="btn btn-primary rounded-pill v-center">
                                <Icon name="ion:add-sharp" :size="18" />
                                <div class="px-1">Add</div>
                            </button>
                        </router-link>
                    </div>
                </div>
                <div class="py-3 px-2">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="allNetworks"
                        :filterKeys="['name', 'shortName']"
                    />
                </div>
                
                <ul class="list-group list-group-flush w-full no-select">
                    <li v-if="networksDataToRender != null"
                        v-for="(item,index) in networksDataToRender" 
                        class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        :key="index"
                        role="button" 
                        @click="onItemClick(item)"
                    >
                        <div class="d-flex align-items-center">
                            <Image 
                                :width="16"
                                :height="16"
                                :src="item.icon" 
                                alt=""
                                :placeholder="item.name.charAt(0)"
                                class="rounded-circle mselect-icon"
                            />
                        
                            <div class="no-select ms-2">
                                <div class="fw-medium">{{ item.name }} &nbsp;
                                    <span class='fs-12 hint'>{{item.chainId}} </span>
                                </div>
                                
                            </div>
                        </div>
                        <Icon name="clarity:check-line" 
                            :size="24"
                            v-if="activeNetwork != null && activeNetwork.chainId == item.chainId"
                            class="me-2 text-primary"
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
        <Modal
            :id="modalId"
            :title="modalTitle"
            :has-header="true"
            :has-footer="false"
            size="modal-sm"
        >
            <template #body>
                <ul class="list-group list-group-flush w-full no-select"
                    v-if="selectedItem"
                >
                    <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        role="button"
                        @click.prevent="setDefaultNetwork"
                    >
                        <div>Set as Default</div>
                        <Icon name="clarity:check-line" class='text-primary' :size="24" />
                    </li>
                    <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                        role="button"
                        @click="onEditItemClick"
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
        </Modal>
    </WalletLayout>
</template>
