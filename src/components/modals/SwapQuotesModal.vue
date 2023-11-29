<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';
import { Modal as bsModal } from 'bootstrap';
import  { useTokens } from "../../composables/useTokens"
import { formatUnits } from 'ethers';

const p = defineProps({
    data: { type: Array, default: [] },
    tokenB: { type: Object, default: {} },
    selected: { type: Number, default: 0}
})

const emits = defineEmits(['select'])

const id = ref("quotesModal")
const selected = ref(p.selected)
const { getTokenByAddr } = useTokens()
const nativeToken = ref()

onBeforeMount(async ()=> {
    nativeToken.value = await getTokenByAddr(Utils.nativeTokenAddr)
})

const getQuoteSrcInfo = (item) => {
    return Utils.getQuoteSrcInfo(item.routeInfo.parsedGroup)
}

const onItemClick = (index) => {
    selected.value = index
    emits("select", index)
    bsModal.getInstance("#"+id.value).hide()
}
</script>
<template>
    <Modal
        :id="id"
        title="Quotes"
        :has-header="true"
        :has-footer="false"
        size="modal-sm"
    >
        <template #body>
            <div class="p-2">
                <div v-if="p.data.length == 0" class="py-4 text-center">
                    No Quotes
                </div>
                <div v-else>
                    <table class="table align-middle table-borderless">
                        <thead>
                            <tr class="fs-14 fw-semibold">
                                <th>Receive ({{ p.tokenB.symbol.toUpperCase() }})</th>
                                <th>Gas Fee ({{ nativeToken.symbol.toUpperCase() }})</th>
                                <th>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, index) in p.data" :key="index">
                                <tr @click="onItemClick(index)"
                                    :class="(selected == index) ? 'selected': ''"
                                >
                                    <td class="break-text text-left">
                                        <div class="px-2">
                                            {{ Utils.formatCrypto(item.formattedAmountOutWithSlippage, 4) }}
                                        </div>
                                    </td>
                                    <td>
                                        <div v-if="!item.gasFee"></div>
                                        <div v-else>
                                            {{ Utils.formatCrypto(formatUnits(item.gasFee, nativeToken.decimals), 4) }} 
                                        </div>
                                    </td>
                                    <td>
                                        <div :class="`btn btn-sm rounded-lg text-capitalize ${getQuoteSrcInfo(item).cssClass}`">
                                            {{ getQuoteSrcInfo(item).name }}
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </Modal>
</template>
<style lang="scss" scoped>
table {
    table-layout: fixed !important;
    width: 100% !important; 
    border-collapse: separate; 
    border-spacing: 0 4px;
    border: none;

    td, th {
        text-align: center !important;
    }

    tbody {
        
        padding-top: 20px !important;

        tr{
            border-radius: 12px !important;
            background: var(--bs-body-bg-dark-6) !important;
            width: 100%; 
            padding: 10px 0px !important;
            cursor: pointer;

            &.selected {
                background: var(--bs-primary) !important;
            }

            td {
                padding: 15px 0px !important;
                border: none !important;
                background: none !important;
                text-align: center;
                &:first-of-type {
                    border-top-left-radius: 8px !important;
                    border-bottom-left-radius: 8px !important;
                }

                &:last-of-type {
                    border-top-right-radius: 8px !important;
                    border-bottom-right-radius: 8px !important;
                }
            }
        }
    }
}
</style>