<script setup>
import { ref, onMounted } from 'vue';
import sanitizeHtml from 'sanitize-html';

const props = defineProps({
    content: { type: String, default: ""},
    lines: { type: Number, default: 2 }
})

const contentRef = ref()
const content = ref("")
const hasToggle = ref(false)
const toggleBtnText = ref("")

onMounted(() => {
    
    const cleanContent = sanitizeHtml(props.content, {  
                            allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ] 
                        });

    if(cleanContent.length > 80){
        hasToggle.value = true
        toggleContent()
    }

    content.value = cleanContent
})

const toggleContent = () => {
    let c = contentRef.value
    let clz = c.classList 

    if(clz.contains("clamp-content")){
        clz.remove("clamp-content", "fade-text")
        toggleBtnText.value = "Show less"
    } else {
        clz.add("clamp-content", "fade-text")
        toggleBtnText.value = "Show more"
    }
}
</script>
<template>
    <p ref="contentRef" class="text-break">{{ content }}</p>
    <div v-if="hasToggle" class='c-toggler d-flex d-block w-full justify-content-center'>
        <a href="#" class='btn btn-none w-full text-primary' @click.prevent="toggleContent">
            {{toggleBtnText}}
        </a>
    </div>
</template>
<style lang="scss" scoped>
.clamp-content {
    display: -webkit-box;
    max-width: calc(100%);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    position: relative;

    &.fade-text { 
        &::after{
            content: "";
            position: absolute;
            left: 0px;
            right: 0px;
            bottom: 0px;
            height: 45px; 
            background: linear-gradient(
                to top, 
                rgba(var(--bs-body-bg-rgb), 1), 
                rgba(var(--bs-body-bg-rgb), 0.8),  
                rgba(var(--bs-body-bg-rgb), 0.6),
                rgba(var(--bs-body-bg-rgb), 0.1)
            );
            box-shadow: 1px -28px 133px -16px rgba(var(--bs-body-bg-rgb),0.6);
        }
    }
}

.c-toggler {
    position: relative;
    top: -25px;
    padding-top: 10px;
    background: transparent !important;
}
</style>