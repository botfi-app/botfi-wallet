<script setup>
import { onMounted, watch, ref, computed } from 'vue';
import { useActivity } from '../../composables/useActivity';
import Utils from "../../classes/Utils"
import { Modal as bsModal } from 'bootstrap'

const props = defineProps({
    contract: { type: String, default: "" },
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

const  { activityList } = useActivity()
const  activityArr = ref([])
const  viewerData = ref(null)
let    viewerModal = null

const icons = { 
                "send": { icon: "iconoir:arrow-tr", class: "text-success" },
                "receive": { icon: "iconoir:arrow-br", class: "text-warning" },    
            }


watch(activityList, () => {
    processActivityList() 
})

onMounted(() => {

})

const processActivityList = () => {

    let p = props
    let data= []
    
    for(let item of activityList.value){
        if(p.contract != "" && item.contract != p.contract) continue;

        item.title = getTitle(item)
        item.iconInfo = iconInfo(item)

        data.push(item)
    }
    activityArr.value = data

    
    if(viewerModal == null && data.length > 0){
        viewerData.value = data[0]
        viewerModal = bsModal.getInstance("#activity-viewer")
    }
}

const getTitle = (item) => {
    
    let title = item.title 
    let titleParams = item.titleParams || {}
    
    for(let name of Object.keys(titleParams)){
        title = title.replace(new RegExp(`{${name}}`, 'g'), titleParams[name])
    }

    title = title.replace(/_/g, " ")

    return title
}

const transferAmtPrefix  = (item) => {
    return (item.extraInfo.transferType == 'send')
            ? '-'
            : '+' 
}

const openViewerModal = (item) => {
   viewerData.value = item

   if(viewerModal == null){
        viewerModal = bsModal.getInstance("#activity-viewer")
   }

   viewerModal.show()
}

const iconInfo = (item) => {
    if(['token_transfer', 'nft_transfer'].includes(item.activityType)){
        return icons[item.extraInfo.transferType]
    }
}
</script>
<template>
    <div v-if="activityArr.length == 0">
        <NoResults />
    </div>
    <div v-else>
        <template v-for="(item,index) in activityArr">
            <div class="px-2 pb-4 m-pointer" @click.prevent="openViewerModal(item)">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex">
                            <div :class="`tx-icon me-1 center-vh ${item.iconInfo.class}`">
                                <Icon :name="item.iconInfo.icon" />
                            </div>
                            <div>
                                <h6 class="fw-semibold my-0 py-0 text-capitalize ">
                                    {{ item.title }}
                                </h6>
                                <div class="text-success mt-1 fw-semibold fs-12 ls-2">
                                    Confirmed
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-end text-right">
                        <div v-if="['token_transfer', 'nft_transfer'].includes(item.activityType)">
                            <h6 class="fw-medium d-flex text-end py-0 my-0 text-right">
                                <div>{{ transferAmtPrefix(item) }}</div>
                                <div>
                                    {{ item.extraInfo.amountDecimal }} {{ item.extraInfo.tokenSymbol  }}
                                </div>
                            </h6>
                        </div>
                        <div v-if="'txDate' in item  && typeof item.txDate == 'number'" 
                            class="fw-medium fs-12 hint mt-1 text-end"
                        >
                            {{ Utils.formatDateMillis(item.txDate, 'MMM D, YY H:mm') }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <ActivityViewerModal 
            v-if="viewerData != null"
            :data="viewerData"
            :key="viewerData.hash"
        />
    </div>
</template>
<style scoped>
.tx-icon {
    width: 32px;
    height: 32px;
    border-radius: 16px;
}
</style>