<script setup>
import { useWalletStore } from '../../store/walletStore';
import Utils from '../../classes/Utils';
import Avatar from '../common/Avatar.vue';
import { onBeforeMount, ref, watch } from 'vue';
import { Modal as bsModal } from 'bootstrap';

const p = defineProps({
            btnClass: { type: String, default: '' }
          })

const emits = defineEmits(["change"])

const walletStore = useWalletStore()
const id = ref("account-select-modal")
const dataToRender = ref(null)
const isLoading = ref(false)


onBeforeMount(async() => {
   // acctsArr.value = await walletStore.getWalletAddresses()
})


const onSearch = async (keyword, filteredData) => {
   dataToRender.value = filteredData
}

const updateWallet = async (item, key) => {

    let loader = Utils.loader("Setting Active Wallet")
    let resultStatus = await walletStore.setActiveWallet(item.address)
    
    loader.close()

    if(resultStatus.isError()){
       return Utils.mAlert(resultStatus.getMessage())
    }

    emits("change", item.address)

    bsModal.getInstance(`#${id}`).hide()
}
</script>
<template>
    <div v-if="walletStore.activeWallet">
        <button 
            :class="`btn text-truncate acct-select-btn ms-1  center-vh rounded-circle`"
            data-bs-toggle="modal"
            :data-bs-target="'#'+id"
        >
            <Avatar 
                :name="walletStore.activeWallet.address" 
                :square="false" 
                :size="38" 
                variant="ring"
                class="rounded"
                :key="walletStore.activeWallet.address"
            />
        </button>
    </div>
    <Modal
        :id="id"
        title="Wallets"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
    >
        <template #body>
            
            <ScrollToTop
               :scrollElement="`#${id}`"
            />

            <div class="w-800 mb-5">
              
                <div class="p-2 my-2 search-sticky">
                    <search-form 
                        placeholder="Search"
                        @change="onSearch"
                        :dataToFilter="walletStore.wallets || []"
                        :filterKeys="['name', 'address']"
                        :mode="{start: true, end: true }"
                        :key="`${walletStore.wallets.length}-${(walletStore.activeWallet || {}).address}`"
                    />
                </div>
                <loading-view :isLoading="isLoading">
                
                    <ul class="list-group list-group-flush w-full no-select">
                        <li v-if="dataToRender != null"
                            v-for="(item,key) in dataToRender" 
                            class="list-group-item list-group-item-action w-full py-4 d-flex justify-content-between"
                            :key="key"
                            role="button" 
                            @click="updateWallet(item, key)"
                        >

                            
                            <div class="pe-2 d-flex align-items-start">
                                <div>
                                    <Avatar 
                                        :name="item.address" 
                                        :size="28"
                                        :square="true"
                                        variant="ring"
                                        class="rounded me-1"
                                        :id="`addr-icon-${item.address}`"
                                    />  
                                </div>                        
                                <div class="no-select addr-item flex-grow-1">
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

                            <div>
                                <Icon name="mdi:success" 
                                    :size="24"
                                    v-if="walletStore.activeWallet.address != null && 
                                        walletStore.activeWallet.address == item.address"
                                    class="ms-3 text-success"
                                />
                            </div>
                        </li>
                    </ul>
                </loading-view>
            </div>

        </template>
    </Modal>
</template>
<style lang="scss">
 .acct-select-btn {
    height: 45px;
    width: 45px;
    padding: 0px;
    border-radius: 50%;
    background: var(--bs-body-bg-dark-4) !important;
 }
</style>