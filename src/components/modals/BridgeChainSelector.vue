<script setup>

import {ref} from 'vue'

const props = defineProps({
                chains: {type: Array, default: []},
                selected: { type: String, default: ''},
                title: { type: String, default: ''},    
            })

const id = ref("bride_chain_select"+ Date.now())
const emit = defineEmits(['select', "init"])

</script>
<template>
    <button class="btn btn-none">
        {{ props.title }}
    </button>
    <Modal
        :id="id"
        :title="props.title"
        :has-header="true"
        :has-footer="false"
        size="modal-md"
    >
        <template #body>
            
        </template>
    </Modal>
</template>