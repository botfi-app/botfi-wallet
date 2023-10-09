<script setup>
import { ref, onBeforeMount, inject } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";
import Http from "../../classes/Http"  
import Utils from "../../classes/Utils";


const props = defineProps({
    renderer: { type: Object, required: true },
    uri: { type: String, required: true },
    queryParams: { type: Object, default: {} },
    resultsDataKey: { type: String, default: ""},
    containerClass: { type: String, default:"d-flex flex-wrap" },
    noResultsText: { type: String, default: "" },
    extraData: { type: Object, default: {} }
})

const dataArray = ref([])
let pageNo = 1;
let pagingInfo = null
const errorMsg = ref("")
const noResultsText = ref("")
const isLoading = ref(false)
const initialReqDone = ref(false)

onBeforeMount(() => {
    noResultsText.value = (props.noResultsText.trim() != "")
                ? props.noResultsText
                : "Nothing Here"
})

const load = async $state => {

    let p = props;

    try {

        isLoading.value = true
        errorMsg.value = ""

        let qParams = p.queryParams;
        let params = { ...qParams, pageNo }
        
        let resultStatus = await Http.getApi(p.uri, params)

        initialReqDone.value = true

        ///console.log(resultStatus)

        if(resultStatus.isError()){
            errorMsg.value = resultStatus.getMessage()
            if(errorMsg.value== ""){
                errorMsg.value = Utils.systemErrorMsg
            }
            return $state.error()
        }
        
        let dataObj = resultStatus.getData() || null;

        //console.log("dataObj====>", dataObj)

        if(dataObj == null){
            return $state.complete();
        }

        if(p.resultsDataKey != ""){
            dataObj = dataObj[p.resultsDataKey]
        }

        let itemsArray = dataObj.itemsArray || []
        pagingInfo = dataObj.pagingInfo;

        //console.log( pagingInfo.value )

        if(itemsArray.length > 0){
            dataArray.value.push(...itemsArray)
            $state.loaded()
        }

        if(pagingInfo.nextPage == pageNo || pageNo >= pagingInfo.lastPage){
            $state.complete();
        } else {
            pageNo++
        }

    }catch(e){
        console.log(e)
        Utils.logError(`InfiniteScroll# uri: ${p.uri}`, e)
        errorMsg.value = Utils.generalErrorMsg
        $state.error()
    } finally {
        isLoading.value = false
    }
}


</script>

<template>
    <div :class="props.containerClass">
        <NoResults  
            :text="noResultsText" 
            v-if="!isLoading && initialReqDone && errorMsg == '' && dataArray.length == 0"
        />
        <template v-else v-for="(item, index) in dataArray" :key="index">
            <component 
                :is="props.renderer" 
                v-bind="{ data: item, extraData: props.extraData }" 
            />
        </template>
    </div>
    <InfiniteLoading @infinite="load" :distance="10">
        <template #error="{ retry }">
            <div class="d-flex flex-column align-items-center my-5">
                <div class="fs-14 my-2">{{  errorMsg }}</div>
                <button class="btn btn-success rounded-pill" @click="retry">
                    Retry
                </button>
            </div>
        </template>
        <template #complete>&nbsp;</template>
        <template #spinner>
            <div class="full-width d-flex align-items-center justify-content-center my-1">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </template>
    </InfiniteLoading>
</template>