<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import Utils from "../../classes/Utils"

const p = defineProps({
    params: { type: Array, default: [] }
})

const primaryType = ref("")
const contentObj = ref({})


const processData = async () => {
    
    let sigObj = p.params[1] || "{}"

    if(typeof sigObj == 'string'){
        try { sigObj = JSON.parse(sigObj) } catch(e) { sigObj = {} }
    }
    
    primaryType.value = sigObj.primaryType  || ""
    contentObj.value = sigObj.message || {}
}

onBeforeMount(() => {
 processData()
})

watch(p, () => {
    processData()
}, { deep: true })

</script>
<template>
    <div class="text-start my-2">
        <div class="fs-12 fw-semibold text-capitalize mt-2">
           Type
        </div>
        <div class="fs-12 fw-semibold">
            {{ primaryType }}
        </div>
        <div>
            <template v-for="(value, name) in (contentObj || {})">
                <div class="fs-12 fw-semibold text-capitalize my-2">
                    <div :class="(typeof value == 'object' ? 'fs-14': '')">
                        {{ name }}:
                    </div>
                    <div  :class="(typeof value != 'object' ? 'text-break': '')"
                        v-html="Utils.jsonToHTMLRow(value)" 
                    />
                </div>
            </template>
        </div>
    </div>
</template>