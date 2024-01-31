<script setup>
/**
 * BotFi (https://botfi.app)
 * @author BotFi <hello@botfi.app>
 * @license MIT 
 */

import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/walletStore';
import { ref, watch } from 'vue'
import NewWalletModal from '../../components/modals/NewWalletModal.vue';
import WalletNameEditor from '../../components/modals/WalletNameEditor.vue';
import { Modal as bsModal } from 'bootstrap'
import Utils from '../../classes/Utils';
import RevealPrivateKey from '../../components/modals/RevealPrivateKey.vue';
import ImportWallet from '../../components/modals/ImportWallet.vue';

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
const importWalletModalId = ref("import-wallet-"+Date.now())

const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const importWallet = () => {
    bsModal.getOrCreateInstance('#'+importWalletModalId.value).show()
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

const copyAddress = async (addr) =>{
     Utils.copyText({text: addr, showToast: true, successText: "Address copied" })
}
</script>
<template>
    <WalletLayout
        title="Wallet Addresses"
        :show-nav="false"
    >   

        <div class="w-800 mb-5">
            <div class="d-flex p-2 align-items-center justify-content-between flex-nowrap">

                <div class="center-vh">
                    <NativeBackBtn />
                    <div class="fw-semibold fs-6 pe-2">Wallets</div>
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
            <div class="p-2 my-2 search-sticky">
                <search-form 
                    placeholder="Search"
                    @change="onSearch"
                    :dataToFilter="walletStore.wallets"
                    :filterKeys="['name', 'address']"
                    :mode="{start: true, end: true }"
                    :key="`${walletStore.wallets.length}-${(walletStore.activeWallet || {}).address}`"
                />
            </div>
            <loading-view :isLoading="isLoading" :key="dataState">
             
                <ul class="list-group list-group-flush w-full no-select">
                    <li v-if="dataToRender != null"
                        v-for="(item,key) in dataToRender" 
                        class="list-group-item list-group-item-action w-full py-4 d-flex justify-content-between"
                        :key="key"
                        role="button" 
                        @click="onItemClick(item, key)"
                    >

                        
                        <div class="pe-2 d-flex">
                            <div>
                                <Avatar 
                                    :name="item.address" 
                                    :size="24"
                                    :square="true"
                                    variant="ring"
                                    class="rounded me-1"
                                    :id="`addr-icon-${item.address}`"
                                />    
                            </div>                      
                            <div class="no-select addr-item">
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
                        </div>

                        <div v-if="walletStore.activeWallet.address != null && 
                                    walletStore.activeWallet.address == item.address"
                        >
                            <Icon name="solar:star-circle-bold-duotone" 
                                :size="32"
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

            <ImportWallet
                :id="importWalletModalId"
                @success="dataState = Date.now()"
            />

            <Modal
                :id="menuModalId"
                :title="menuModalTitle"
                :has-header="true"
                :has-footer="false"
                size="modal-md"
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
<style lang="scss" scoped>
.addr-item { 
    line-height: 20px !important;
}
</style>