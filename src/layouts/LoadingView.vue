<script setup>
    const props = defineProps({
        isLoading: {type: Boolean, default: false }
    })
</script>
<template>
    <template v-if="props.isLoading">
        <div class="parent flex items-center justify-center">
            <div class="text-center py-10">
                <k-preloader size='w-6 h-6' class="k-color-botfi-primary" />
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