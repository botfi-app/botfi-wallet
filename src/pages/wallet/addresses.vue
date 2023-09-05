<script setup>

import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';
import { ref, watch } from 'vue'
import Avatar from '../../components/common/Avatar.vue';
import NewWalletModal from '../../components/modals/NewWalletModal.vue';
import WalletNameEditor from '../../components/modals/WalletNameEditor.vue';
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';
import RevealPrivateKey from '../../components/modals/RevealPrivateKey.vue';

const walletStore = useWalletStore()
const isLoading   = ref(false)
const menuModalTitle  = ref("")
const selectedItem = ref(null) 
const menuModalId = ref('address-modal-'+Date.now())
const newWalletModalId = ref("new-wallet-modal-"+Date.now())
const dataState = ref(Date.now())
const dataToRender = ref(null)
const menuModalInst = ref(null)
const walletNameEditorModalId = ref("wallet-name-editor-modal-"+Date.now())
const revealPKModalId = ref("reveal-pk-modal-"+Date.now())

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const importWallet = () => {

}



const onItemClick = async (item, key) => {
   
   if(menuModalInst.value == null){
        menuModalInst.value = bsModal.getOrCreateInstance('#'+menuModalId.value)
   }
   
   item["key"] = key

   selectedItem.value = item 

   let iconDom = document.getElementById(`addr-icon-${item.address}`).outerHTML;

   menuModalTitle.value = `<div class='center-vh'>
                                <div class="d-inline mt-1">${iconDom}</div>
                                <div class='ps-3 pe-2' style='line-height:18px;'>
                                    <span class='fs-14 text-break'>${item.address}</span>
                                    <span class='ms-1 fs-12 hint font-monospace'>${item.name}</span>
                                </div>
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

const editItemName = async () => {
    menuModalInst.value.hide()
    bsModal.getOrCreateInstance('#'+walletNameEditorModalId.value).show()
}

const handleRevealPrivateKey = () => {
    menuModalInst.value.hide()
    bsModal.getOrCreateInstance('#'+revealPKModalId.value).show()
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

const copyAddress = async (addr) => {

    let status = await Utils.copyToClipboard(addr)
    
    if(status == 'copied'){
        Utils.toast("Address copied")
    } else {
        Utils.toast("Address copy failed")
    }
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
                        v-for="(item,key) in dataToRender" 
                        class="list-group-item list-group-item-action py-4 center-vh"
                        :key="key"
                        role="button" 
                        @click="onItemClick(item, key)"
                    >

                        <div class="pe-2">
                            <Avatar 
                                :name="item.address" 
                                :size="38"
                                :square="true"
                                variant="ring"
                                class="rounded"
                                :id="`addr-icon-${item.address}`"
                            />
                        </div>
                        <div class="d-flex center-vh">
                          
                            <div class="no-select">
                                <span class="text-break fs-14">
                                    {{ item.address }} 
                                </span>
                                <span 
                                    class='fs-12 hint ms-2 font-monospace'
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

            <WalletNameEditor
                v-if="selectedItem"
                :id="walletNameEditorModalId"
                :data="selectedItem"
                @success="dataState = Date.now()"
                :key="selectedItem.address"
            />

            <RevealPrivateKey
                v-if="selectedItem"
                :id="revealPKModalId"
                :data="selectedItem"
                @success="dataState = Date.now()"
                :key="selectedItem.address"
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
                            <div>Set as Active</div>
                            <Icon name="solar:star-circle-bold-duotone" 
                                class='text-primary' 
                                :size="28" 
                            />
                        </li>
                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            role="button"
                            @click.prevent="copyAddress(selectedItem.address)"
                        >
                            <div>Copy Address</div>
                            <Icon name="solar:copy-bold-duotone" 
                                class='text-primary' 
                                :size="26" 
                            />
                        </li>
                        
                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            role="button"
                            @click="handleRevealPrivateKey"
                        >
                            <div>Reveal Private Key</div>
                            <Icon 
                                name="solar:password-minimalistic-input-bold-duotone"
                                class='text-primary' 
                                :size="28" 
                            />
                        </li>

                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            role="button"
                            @click="editItemName"
                        >
                            <div>Edit Name</div>
                            <Icon name="solar:document-add-bold-duotone" 
                               class='text-primary' 
                               :size="24" 
                            />
                        </li>
                        <li class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                            v-if="selectedItem.chainId != 1"
                            role="button"
                            @click.prevent="removeWallet"
                        >
                            <div>Remove Wallet</div>
                            <Icon name="solar:trash-bin-minimalistic-2-bold-duotone" class='text-danger' :size="24" />
                        </li>
                    </ul>
                </template>
            </Modal>
        </div>
    </WalletLayout>
</template>