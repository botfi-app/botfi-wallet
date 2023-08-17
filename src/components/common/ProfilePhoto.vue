<script setup>
import { onBeforeMount, ref } from 'vue';
import Avatar from './Avatar.vue';


const props = defineProps({
                userId: String
            })

onBeforeMount(() => {
    initialize()
})

const initialized = ref(false)

const initialize = async () => {

}
</script>
<template>
    <div v-if="!initialized">
        <Avatar :name="props.userId" :size="38" class="" />
    </div>
    <div v-else>

    </div>
</template>