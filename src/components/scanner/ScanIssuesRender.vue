<script setup>
    const p = defineProps({
        id: { type: String, default: Date.now() },
        title: { type: String, default: "" },
        data: { type: Array, default: [] }
    })
</script>
<template>
    <div class="accordion-item px-0 mx-0">
        <h2 class="accordion-header">
            <button class="accordion-button collapsed px-2" 
                type="button" 
                data-bs-toggle="collapse" 
                :data-bs-target="`#${p.id}-collapse`" 
                aria-expanded="false" 
                :aria-controls="`${p.id}-collapse`"
            >
                <div class="fw-bold text-upper ls-2 hint fs-11">
                    {{ p.title }}
                </div>
            </button>
        </h2>
        <div :id="`${p.id}-collapse`" 
            class="accordion-collapse collapse px-0 mx-0 is-sticky" 
            data-bs-parent="#scan-analysis"
        >
            <div class="accordion-body px-0">
                <ul class="list-group list-group-flush px-0 mx-0">
                    <template v-for="item in p.data">
                        <li class="list-group-item py-4 mx-0 d-flex align-items-start"
                            v-if="!(
                                [null, ''].includes(item.scwTitle) &&
                                [null, ''].includes(item.scwDescription)
                            )"
                        >
                            <div class="icon">
                                <Icon 
                                    name="clarity:success-standard-line" 
                                    class="text-success"
                                    :size="18" 
                                    v-if="item.issues.length == 0"
                                />
                                <Icon 
                                    v-else
                                    name="ep:warning" 
                                    class="text-danger"
                                    :size="18" 
                                />
                            </div>
                            <div class="ms-2">
                                <div v-if="!['', null].includes(item.scwTitle)">
                                    {{ item.scwTitle }}
                                </div>
                                <div class="fs-14" v-if="!['', null].includes(item.scwDescription)">
                                    {{ item.scwDescription }}
                                </div>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .icon {
        position: relative;
        top: -2.2px;
    }
</style>