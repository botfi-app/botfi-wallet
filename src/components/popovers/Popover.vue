<script setup>
import { Dropdown as VDropdown } from 'floating-vue'
</script>
<template>
    <VDropdown :attrs="$attrs">
        <slot />

        <template #popper>
            <slot name="content" />
        </template>
    </VDropdown>
</template>