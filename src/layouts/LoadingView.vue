<script setup>
    const props = defineProps({
        isLoading: {type: Boolean, default: false },
        loadingText: {type: String, default: "" },
    })
</script>
<template>
    <template v-if="props.isLoading">
        <div class="parent d-flex align-items-center justify-content-center py-4">
            <div class="center-vh text-center">
                <div>
                    <div class="loader loader-sm"></div>
                    <div v-if="props.loadingText!=''" class="text-center my-1">
                        {{ props.loadingText }}
                    </div>
                </div>
            </div>
        </div>
    </template>
    <template v-else>
        <slot />
    </template>
</template>

<style lang="scss" scoped>
    .parent {
      padding: 10px;
        
      &.full-mode {
        width: 100%;
        z-index: 100;
        height: calc(100% - 75px);
        overflow: hidden;
        z-index: 100;
        padding: 0px;
      }
    }
</style>