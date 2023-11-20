<script setup>
import { ref } from 'vue';
import Utils from '../../classes/Utils';
import { Modal as bsModal } from 'bootstrap';

const p = defineProps({
    data: { type: Array, default: [] },
    selected: { type: Number, default: 0}
})

const emits = defineEmits(['select'])

const id = ref("quotesModal")
const selected = ref(p.selected)

//console.log(p.data)

const getSrc = (item) => {
    return Utils.getSwapSource(item.routeGroup)
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
                            <tr><th>Receive</th><th>Gas Fee</th><th>Source</th></tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, index) in p.data" :key="index">
                                <tr @click="onItemClick(index)"
                                    :class="(selected == index) ? 'selected': ''"
                                >
                                    <td class="break-text text-left">
                                        {{ Utils.formatFiat(item.formattedAmountOutWithSlippage, 8) }}
                                    </td>
                                    <td>
                                       N/A
                                    </td>
                                    <td>
                                        <div class="btn btn-warning btn-sm rounded-lg" 
                                            v-if="getSrc(item) == 'direct'"
                                        >
                                            Direct
                                        </div>
                                        <div v-else class="btn btn-soft-success btn-sm rounded-lg">
                                            Aggregate
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