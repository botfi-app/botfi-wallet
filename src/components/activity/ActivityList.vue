<script setup>
import { onBeforeMount, watch, ref, computed } from 'vue';
import { useActivityStore } from '../../store/activityStore';
import Utils from "../../classes/Utils"

const props = defineProps({
    contract: { type: String, default: "" },
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

const { activityList } = useActivityStore()

const labels = { 
                "token_send": { icon: "", class: "" },
                "token_receive": { icon: "", class: "" },    
               }

 onBeforeMount(()=> {
    //console.log("activityList===>", activityList)
 }) 

const processActivityList = () => {
    return activityList
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
</script>
<template>
    <template v-for="(item,index) in activityList">
        <div class="px-2 pb-4">
            <div class="d-flex justify-content-between">
                <div>
                    <h6 class="fw-semibold text-capitalize py-0 my-0">
                        {{ getTitle(item) }}
                    </h6>
                    <div class="text-success fw-semibold fs-12 text-upper ls-2">
                        Confirmed
                    </div>
                </div>
                <div>
                    <div v-if="['token_transfer', 'nft_transfer'].includes(item.activityType)">
                        <h6 class="fw-medium d-flex">
                            <div>{{ transferAmtPrefix(item) }}</div>
                            <div>
                            {{ item.extraInfo.amountDecimal }} {{ item.extraInfo.tokenSymbol  }}
                            </div>
                        </h6>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>