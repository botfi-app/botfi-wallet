<script setup>
const props = defineProps({
    title: { type: String, default: ""},
    options: { type: Array, default: []},
    selected: { type: String, default: "" }
})
</script>

<template>
    <div class="modal"  
        data-bs-backdrop="static" 
        id="modal-select" 
        tabindex="-1"
    >
        <div class="modal-dialog dialog-sm show">
            <div class="modal-header">
                <h5 class="modal-title">{{ props.title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-content rounded-lg mt-10">
                <ul class="list-group list-group-flush">
                    <a href="#" v-for="(item,index) in props.options" 
                        class="list-group-item list-group-item-action py-2 d-flex justify-items-between align-items-center"
                        :key="index"
                    >
                        <div class="d-flex">
                            <Icon name="clarity:check-line" 
                                :size="24"
                                v-if="props.selected != '' && props.selected == item.value"
                                class="me-2 text-success"
                            />
                            <div>{{ item.text }}</div>
                        </div>
                        <img :width="24"
                            :height="24"
                            :src="item.iconUrl" 
                            alt=""
                            v-if="item.iconUrl && item.iconUrl != ''"
                            loading='lazy'
                        />
                    </a>
                </ul>
            </div>
        </div>
    </div>
</template>