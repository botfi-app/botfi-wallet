
<script setup>
import { ref, watch } from 'vue';
import Http from '../../classes/Http';
import browserConfig from '../../config/browser';
import Utils from '../../classes/Utils';

const p = defineProps({
    keyword: { type: String, default: ""}
})

const resultsArr = ref([])

watch(p, () => {
    doSearch()
}, { deep: true })


const doSearch = async () => {

    let keyword = p.keyword;

    resultsArr.value = []

    if(keyword.trim() == "") return;

    await Utils.waitInSecs(0.1)

    if(keyword != p.keyword) return;

    let url = browserConfig.searchSuggestionApi
                .replace("{{KEYWORD}}", p.keyword)

    let resultStatus = await Http.getJSONP(url)

    //console.log("resultStatus===>", resultStatus)

    if(resultStatus.isError()){
       Utils.logError("resultStatus:", resultStatus.getMessage())
        return false;
    }

    let dataArr = resultStatus.getData() || []

    //console.log("dataArr===>", dataArr)

    resultsArr.value = dataArr[1] || []

   // console.log("resultsArr.value===>", resultsArr.value)
}

</script>
<template>
    <ul v-if="resultsArr.length > 0"  
        class="list-group list-group-flush"
    >
        <template v-for="word in resultsArr">
            <li @click.prevent="$emit('select', word)" class="list-group-item">
                <div class="space-between align-items-between">
                    <div>{{ word }}</div>
                    <div><Icon name="iconamoon:search" /></div>
                </div>
            </li>
        </template>
    </ul>
</template>