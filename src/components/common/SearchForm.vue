<script setup>
import { onMounted, ref, watch } from 'vue';


const props = defineProps({
    placeholder: { type: String, default: 'Search' },
    mode: { type: Object, default: {start: true, end: false }},
    dataToFilter: { type: null, default: [] },
    filterKeys: { type: Array, required: true }
})

const emits = defineEmits(['change'])

const keyword = ref("")
const searchForm = ref()

onMounted(() => {
    handleOnChange()
    window.setTimeout(() => handleClearBtnVisibility(), 200)
})

const handleInputState = (type) => {
    let clzz =  searchForm.value.classList;
    (type == 'focus')
        ? clzz.add('focus')
        : clzz.remove('focus')
}

const handleClearBtnVisibility = async () => {
    
    let clzz = searchForm.value.classList;

    if(keyword.value.trim() == ''){
        clzz.remove("input-filled")
    } else {
        clzz.add("input-filled")
    }
}

const clearInput = async () => {
    keyword.value = ''
    handleOnChange()
    handleClearBtnVisibility()
}

const handleOnChange = async () => {

    let _p = props;
    let _k = keyword.value.toLowerCase().trim()
    let { start: matchStart = true, end: matchEnd = false } = _p.mode

    handleClearBtnVisibility()

    if(_p.dataToFilter == null){
        emits("change", keyword.value, null)
        return;
    }

    if(_k == ''){
        emits("change", keyword.value, _p.dataToFilter)
        return; 
    }

    let filteredData =  Array.isArray(_p.dataToFilter) ? [] : {}

    const insertMatched = (_key, _item) => {
        if(Array.isArray(filteredData)){
            filteredData.splice(_key, 0, _item)
        } else {
            filteredData[_key] = _item
        }
    }

    Object.keys(_p.dataToFilter).forEach( key => {
        
        let item = _p.dataToFilter[key]

        if(!item) return;

        //console.log("ite===>", item)

        if(!_p.filterKeys || _p.filterKeys.length == 0){

            let itemStr = item.toString().trim().toLowerCase()

            if( (matchStart && itemStr.startsWith(_k)) ||
                (matchEnd && itemStr.endsWith(_k))
            ){
                insertMatched(key, item)
            } 

        } else {
            for(let fkey of _p.filterKeys){

                let v = (item[fkey] || '').toLowerCase()

                //console.log(v)
                
                if((matchStart && v.startsWith(_k)) || 
                   (matchEnd && v.endsWith(_k) || v.includes(_k)) 
                ){
                    insertMatched(key, item)
                }

                //console.log("filteredData--->", filteredData)
            }
        }
    })

    emits("change", keyword.value, filteredData)
}
</script>
<template>
      <div 
        class="d-flex  align-items-center flex-nowrap search-form " 
            ref="searchForm"
            id="mainSearch"
        >
        <div class="">
            <Icon 
                name="iconamoon:search-light" 
                :size="24" 
                class="ic ic-left" 
            />
        </div>
        <input 
            v-model="keyword"
            type="text" 
            class="form-control form-control-md rounded-pill flex-grow-1 w-full"  
            :placeholder="props.placeholder"
            @focus="handleInputState('focus')"
            @blur="handleInputState('blur')"
            @keyup="handleOnChange"
            :autocapitalize="false"
            :autocorrect="false"
        />

        <div class="">
            <Icon 
                name="solar:close-circle-bold-duotone" 
                :size="24" 
                class="ic ic-right text-primary" 
                @click.prevent="clearInput"
            />
        </div>
    </div>
</template>
<style lang="scss">

    .search-form{
        
        .ic {
            position: absolute;
            opacity: 0.08;
            color: var(--bs-bg-color);
            transition: opacity 0.6s;
        }

        .ic-left{
            margin-top: -12px;
            margin-left: 6px;
        }
        
        .ic-right {
            margin-top: -12px;
            margin-left: -30px;
            z-index: 900;
            cursor: pointer;
            display: none;
            user-select: none;
          
        }

        input {
            padding-left: 35px;
        }

        &.input-filled {
            .ic-right {
                display: inline-block;
                opacity: 0.9 !important;
            }
        }

        &.focus {
            .ic { opacity: 0.9; color: var(--bs-primary); }
        }
    }
</style>