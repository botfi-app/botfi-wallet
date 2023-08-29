<script setup>
import { onMounted, ref, watch } from 'vue';


const props = defineProps({
    placeholder: { type: String, default: 'Search' },
    dataToFilter: { type: null, default: [] },
    filterKeys: { type: Array, required: true }
})

const emits = defineEmits(['change'])

const keyword = ref("")
const searchForm = ref()

onMounted(() => {
    handleOnChange()
})

const handleInputState = (type) => {
    let _sfc = searchForm.value.classList;
    (type == 'focus')
        ? _sfc.add('focus')
        : _sfc.remove('focus')
}

const handleOnChange = async () => {

    let _p = props;
    let _k = keyword.value.toLowerCase().trim()

    if(_p.dataToFilter == null){
        emits("change", keyword.value, null)
        return;
    }

    if(_k == ''){
        emits("change", keyword.value, _p.dataToFilter)
        return; 
    }

    let filteredData =  Array.isArray(_p.dataToFilter) ? [] : {}

    Object.keys(_p.dataToFilter).forEach(key => {
        
        let item = _p.dataToFilter[key]

        if(!_p.filterKeys || _p.filterKeys.length == 0){

            if(item.toString().trim().toLowerCase().startsWith(_k)){
                filteredData[key] = item
            }

        } else {
            for(let fkey of _p.filterKeys){

                let v = (item[fkey] || '').toLowerCase()
                
                if(v.startsWith(_k)){
                    filteredData[key] = item
                }
            }
        }
    })

    emits("change", keyword.value, filteredData)
}
</script>
<template>
      <div 
        class="d-flex  align-items-center flex-nowrap search-form w-full" 
            ref="searchForm"
        >
        <div class="ic-wrapper">
            <Icon 
                name="iconamoon:search-light" 
                :size="24" 
                class="ic text-primary " 
            />
        </div>
        <input 
            v-model="keyword"
            type="text" 
            class="form-control form-control-md rounded-pill"  
            :placeholder="props.placeholder"
            @focus="handleInputState('focus')"
            @blur="handleInputState('blur')"
            @keyup="handleOnChange"
        />
    </div>
</template>
<style lang="scss">

    .search-form{
        .ic-wrapper {
            position: absolute;
            opacity: 0.15;
            .ic {
                position: relative;
                left: 10px;
                color: var(--bs-bg-color);
            }

            transition: opacity 0.6s;
        }

        input {
            padding-left: 35px;
        }

        &.focus {
            .ic-wrapper { opacity: 0.9;}
        }
    }
</style>