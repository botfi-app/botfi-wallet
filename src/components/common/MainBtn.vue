<script setup>
import { inject, onBeforeMount, onBeforeUnmount, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  text: { type: String, default: "Continue" },
  onClick: { type: Function, default: (() => {}) },
  isLoading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  show: { type: Boolean, default: true },
})

const botUtils = inject("botUtils")
const mainBtn = ref(null)
const initialized = ref(true)
const isLoading = ref(props.isLoading)

/*
onBeforeMount(() => {
  initialize()
})

onBeforeUnmount( () => cleanBtn())
onUnmounted(() => cleanBtn())

const cleanBtn = () => {
  if(mainBtn.value){ 
    mainBtn.value.destroy()
    mainBtn.value = null
  }
}

const initialize = () => {

  let _mbtn = botUtils.mainButton({
                  text: props.text,
                  onClick: props.onClick
              });

  if(_mbtn.isSupported()){
    if(props.show) _mbtn.show()
    mainBtn.value =_mbtn
  }

  initialized.value = true
}
*/
</script>
<template>
  <div class="main-btn-wrapper"  v-if="initialized && mainBtn == null">
    <div 
      class="main-btn position-fixed bottom-0 start-0 end-0 mt-5 pt-5"
    >
      <button 
          class="btn btn-primary w-full py-2 fw-medium" 
          :disabled="props.disabled"
          v-if="props.show"
          @click.prevent="props.onClick"
      >
        <template v-if="isLoading">
            <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> 
            Loading..
        </template>
        <template v-else>
          {{ props.text }}
        </template>
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.main-btn-wrapper {
  padding-bottom: 60px;
}
</style>