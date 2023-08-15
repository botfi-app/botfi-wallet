<script setup>
import { inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';

  const props = defineProps({
    text: { type: String, default: "Continue" },
    onClick: { type: Function, default: (() => {}) },
    isLoading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    show: { type: Boolean, default: true },
  })

  const botUtils = inject("botUtils")
  const mainBtn = ref(null)
  const initialized = ref(false)
  const isLoading = ref(props.isLoading)

  onBeforeMount(() => {
     initialize()
  })

  onBeforeUnmount( () => {
    let _mBtn = mainBtn.value
    if(_mBtn){
        _mBtn.disable()
        _mBtn.hide()
    }
  })

  const initialize = () => {

    let _mbtn = botUtils.mainButton({
                    text: props.text,
                    onClick: props.onClick
                });

    if(_mbtn.isSupported()){
        mainBtn.value =_mbtn
        if(props.show) _mbtn.show()
    }

    initialized.value = true
  }

  watch(props, () => {

    let _mBtn = mainBtn.value
    isLoading.value = props.isLoading

    if( _mBtn ){
       (props.isLoading) ? _mBtn.showProgress() : _mBtn.hideProgress()
       (props.disabled) ? _mBtn.disable() : _mBtn.enable()
       (props.show) ? _mBtn.show() : _mBtn.hide()
    }
  }, { deep: true })
</script>
<template>
    <template v-if="initialized && mainBtn == null">
        <button 
            class="btn btn-primary btn-lg w-full rounded-pill shadow" 
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
    </template>
</template>
<style lang="scss" scoped>
</style>