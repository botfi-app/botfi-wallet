<script setup>
import { ref, watch } from 'vue';

    const props = defineProps({
        password: { type: String, default: ""}
    })

    const p = ref(props.password)

    watch(props, () => {
        if(props.password != p.value){
            p.value = props.password
        }
    }, {deep: true })

    const ics = { //Icons and Colors
        true: { c: 'text-emerald-500', i: 'mdi:tick' },
        false: { c: 'text-red-500', i: 'ph:x' }
    } 

    const min6Chars = (type) => ics[p.value.length >= 6][type]
    const hasUpper = (type) => ics[/[A-Z]+/.test(p.value)][type]
    const hasLower = (type) => ics[/[a-z]+/.test(p.value)][type]
    const hasNumber = (type) => ics[/[0-9]+/.test(p.value)][type]
    const hasSpecialChar = (type) => ics[/\W/.test(p.value)][type]
</script>
<template>
     <k-list :key="props.password">
        <k-list-item 
            title="Minimum of 6 characters" 
            :class="`text-sm ${min6Chars('c')}`"
            color="red"
        >
            <template #media>
                <Icon :name="min6Chars('i')" :size="16" :class="min6Chars('c')" />
            </template>
        </k-list-item>
        <k-list-item 
            title="Contains an uppercase" 
            :class="`text-sm`"
        >
            <template #media>
                <Icon :name="hasUpper('i')" :size="16" :class="hasUpper('c')" />
            </template>
        </k-list-item>

        <k-list-item 
            title="Contains a numeric value" 
            :class="`text-sm`"
        >
            <template #media>
                <Icon :name="hasNumber('i')" :size="16" :class="hasNumber('c')" />
            </template>
        </k-list-item>

        <k-list-item 
            title="Contains a lowercase" 
            :class="`text-sm`"
        >
            <template #media>
                <Icon :name="hasLower('i')" :size="16" :class="hasLower('c')" />
            </template>
        </k-list-item>

        <k-list-item 
            title="Contains a special character" 
            :class="`text-sm`"
        >
            <template #media>
                <Icon :name="hasSpecialChar('i')" :size="16" :class="hasSpecialChar('c')" />
            </template>
        </k-list-item>
     </k-list>
</template>