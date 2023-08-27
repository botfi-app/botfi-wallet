<script setup>
import { ref, watch } from 'vue';


const props = defineProps({
    placeholder: { type: String, default: 'Search' }
})

const emits = defineEmits(['change'])

const keyword = ref("")
const searchForm = ref()

const handleInputState = (type) => {
    let _sfc = searchForm.value.classList;
    (type == 'focus')
        ? _sfc.add('focus')
        : _sfc.remove('focus')
}

const handleOnChange = async (e) => {
    emits("change", keyword.value)
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