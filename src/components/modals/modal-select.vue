<script setup>
import { onMounted, ref } from 'vue';
import MicroModal from 'micromodal';  // es6 module
import Image from '../common/Image.vue';
import modal from './modal.vue';


const props = defineProps({
    id:       { type: String, default: 'select-modal' },
    title:    { type: String, default: ""},
    options:  { type: Array, default: []},
    selected: { type: null, default: "" },
    size:     { type: String, default: "modal-md" },
    onSelect: { type: Function, default: () => true }
})

const selectedItem = ref(props.selected)

const $emits = defineEmits(["close", "change"])


const handleOptionClick = async (item) => {
    if((await props.onSelect(item)) == true ){
        selectedItem.value = item.value
        $emits("change", item)
    }
}

</script>

<template>
    <modal
        :id="props.id"
        :title="props.title"
    >
        <ul class="list-group list-group-flush w-full">
            <li v-for="(item,index) in props.options" 
                class="list-group-item list-group-item-action py-4 d-flex justify-content-between align-items-center"
                :key="index"
                @click.prevent="handleOptionClick(item)"
            >
                <div class="d-flex">
                    <Icon name="clarity:check-line" 
                        :size="24"
                        v-if="selectedItem != '' && selectedItem == item.value"
                        class="me-2 text-success"
                    />
                    <div>{{ item.text }}</div>
                </div>
                <Image 
                    :width="28"
                    :height="28"
                    :src="item.iconUrl" 
                    alt=""
                    v-if="item.iconUrl && item.iconUrl != ''"
                    :placeholder="item.text.charAt(0)"
                    class="rounded-circle mselect-icon"
                />
            </li>
        </ul>
    </modal>
</template>
