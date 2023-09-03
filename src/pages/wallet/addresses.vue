<script setup>

import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';
import { ref, watch } from 'vue'
import Avatar from '../../components/common/Avatar.vue';
import NewWalletModal from '../../components/modals/NewWalletModal.vue';
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';

const walletStore = useWalletStore()
const isLoading   = ref(false)
const menuModalTitle  = ref("")
const selectedItem = ref(null) 
const menuModalId = ref('address-modal-'+Date.now())
const newWalletModalId = ref("new-wallet-modal-"+Date.now())
const dataState = ref(Date.now())
const dataToRender = ref(null)
const menuModalInst = ref(null)

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const importWallet = () => {

}

const onItemClick = async (item, index) => {
   
   if(menuModalInst.value == null){
        menuModalInst.value = bsModal.getOrCreateInstance('#'+menuModalId.value)
   }
   
   item["index"] = index

   selectedItem.value = item 
   menuModalTitle.value = `<div class='px-2' style='line-height:15px;'>
                                <span class='fs-12 text-break'>${item.address}</span>
                                <span class='ms-1 fs-12 hint'>${item.name}</span>
                            </div>`        
   menuModalInst.value.show()
}

const setActiveWallet = async () => {
    
    let loader = Utils.loader("Setting Active Wallet")
    let resultStatus = await walletStore.setActiveWallet(selectedItem.value.address)
    
    loader.close()

    if(resultStatus.isError()){
       return Utils.mAlert(resultStatus.getMessage())
    }

    dataState.value = Date.now()
    menuModalInst.value.hide()
}

const editItemName = () => {

}

const removeWallet = async () => {
    
    let confirm = await Utils.getSwal().fire({
                    title: "Remove Wallet",
                    text: `Wallet will be permanently removed`,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Confirm"
                })

    if(!confirm.isConfirmed) return false;
    
    let loader = Utils.loader("Removing Wallet")
    let resultStatus = await walletStore.removeWallet(selectedItem.value.address)
    
    loader.close()

    if(resultStatus.isError()){
       return Utils.mAlert(resultStatus.getMessage())
    }

    dataState.value = Date.now()
    menuModalInst.value.hide()
}
</script>
<template>
    <WalletLayout
        title="Wallet Addresses"
        :show-nav="false"
    >   

        <NativeBackBtn />

        <div class="w-400 mb-5">
            
            <loading-view :isLoading="isLoading" :key="dataState">
                <div class="d-flex p-2 align-items-center flex-nowrap">
                    <div class="fw-semibold fs-6 pe-2">Wallets</div>
                    <div class="flex-grow-1">
                        <search-form 
                            placeholder="Search"
                            @change="onSearch"
                            :dataToFilter="walletStore.wallets"
                            :filterKeys="['name', 'address']"
                            :key="`${walletStore.wallets.length}-${walletStore.activeWallet.address}`"
                        />
                    </div>
                    <div class="ps-2">
                        <button class="btn btn-primary rounded-pill v-center"
                            data-bs-toggle="modal" 
                            :data-bs-target="`#${newWalletModalId}`"
                        >
                            <Icon name="ion:add-sharp" :size="18" />
                            <div class="px-1">New</div>
                        </button>
                    </div>
                </div>
                <ul class="list-group list-group-flush w-full no-select">
                    <li v-if="dataToRender != null"
                        v-for="(item,index) in dataToRender" 
                        class="list-group-item list-group-item-action py-4 center-vh"
                        :key="index"
                        role="button" 
                        @click="onItemClick(item, index)"
                    >

                        <div class="pe-2">
                            <Avatar 
                                :name="item.address" 
                                :size="38"
                                :square="true"
                                variant="ring"
                                class="rounded"
                            />
                        </div>
                        <div class="d-flex center-vh">
                          
                            <div class="no-select">
                                <span class="text-break fs-14">
                                    {{ item.address }}
                                </span>
                                <span 
                                    class='fs-12 hint ms-2'
                                    v-if="item.address != item.name"
                                >
                                    {{item.name}} 
                                </span>
                            </div>

                            <Icon name="solar:star-circle-bold-duotone" 
                                :size="32"
                                v-if="walletStore.activeWallet.address != null && 
                                   walletStore.activeWallet.address == item.address"
                                class="ms-3 text-success"
                            />
                        </div>
                    </li>
                </ul>
            </loading-view>
        </div>

        <div>
            <MainBtn 
                text="Import Wallet"
                :onClick="importWallet"
            />
            <NewWalletModal 
                :id="newWalletModalId"
                title="New Wallet"
                @success="dataState = Date.now()"
            />

            <Modal
                :id="menuModalId"
                :title="menuModalTitle"
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
                            @click.prevent="setActiveWallet"
                        >
                            <div>Set as Default</div>
                            <Icon name="solar:star-circle-bold-duotone" 
                                class='text-primary' 
                                :size="28" 
                            />
                        </li>
                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            role="button"
                            @click="editItemName"
                        >
                            <div>Edit Name</div>
                            <Icon name="basil:edit-outline" class='text-primary' :size="24" />
                        </li>
                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            v-if="selectedItem.chainId != 1"
                            role="button"
                            @click.prevent="removeWallet"
                        >
                            <div>Remove Wallet</div>
                            <Icon name="fluent:delete-28-regular" class='text-danger' :size="24" />
                        </li>
                    </ul>
                </template>
            </Modal>
        </div>
    </WalletLayout>
</template>