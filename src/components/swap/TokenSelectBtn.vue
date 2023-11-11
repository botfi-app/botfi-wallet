<script setup>
import Icon from '../common/Icon.vue';
import Image from '../common/Image.vue';

const p = defineProps({
    tokenInfo: { type: null, required: true },
    isFocused: { type: Boolean, default: false }
})

const emits = defineEmits(['open-token-select-modal'])

const openTokenSelectModal = () => {
    emits("open-token-select-modal")
}
</script>
<template>
    <div class="d-flex input-wrapper align-items-center px-3 py-3 rounded-lg">
        <div>
            <div  v-if="p.tokenInfo != null">
                <button @click.prevent="openTokenSelectModal" 
                    class="btn asset center-vh btn-none p-0 rounded-pill"
                >
                    <Image 
                        :src="p.tokenInfo.image" 
                        :placeholder="p.tokenInfo.symbol" 
                        :width="24"
                        :height="24"
                    />
                    <div class="fw-semibold px-2">{{ p.tokenInfo.symbol }}</div>
                    <Icon name="fluent:chevron-down-24-filled" />
                </button>
            </div>
            <div v-else>
                <button @click.prevent="openTokenSelectModal" 
                    class="btn fw-medium btn-primary rounded-pill"
                >
                    <div class="d-flex align-items-center">
                        <div class="me-2">Select</div>
                        <Icon name="fluent:chevron-down-24-filled" />
                    </div>
                </button>
            </div>
        </div>  
        <div class="flex-grow-1">
            <input 
                type="text" 
                v-number
                class="w-full amount-input fw-bold fs-4 text-end"
                placeholder="0"
                :autofocus="isFocused"
            />
        </div>  
    </div>
</template>