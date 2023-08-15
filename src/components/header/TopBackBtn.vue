<script setup>

    import { useRouter } from 'vue-router'

    const props = defineProps({
        text: { type: String, default: "Back" },
        onBtnClick: { type: Function, default: null }
    })

    const router = useRouter()

    const handleClick = () => {
        
        if(props.onBtnClick){
            return props.onBtnClick()
        }

        router.go(-1)
    }
</script>
<template>
    <div>
        <a href="#" 
            class="px-2 py-2" 
            @click.prevent="handleClick" 
        >
            <Icon name="ion:arrow-back" :size="24" />
        </a>
    </div>
</template>