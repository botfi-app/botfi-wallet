<script setup>
import { watch, ref, onUpdated } from 'vue';
import Avatar from '../common/Avatar.vue';
import sidenav from '../../config/sidenav'
import Icon from '../common/Icon.vue'

const props = defineProps({
                opened: { type: Boolean, }
              })

const emits = defineEmits(["close"])
const isOpened = ref(props.opened)

watch(isOpened, () => {
    if(!isOpened.value) emits("close")
})

onUpdated(()=>{
  if(isOpened.value != props.opened) isOpened.value = props.opened
})
</script>
<template>
     <k-panel
      side="left"
      floating
      :opened="isOpened"
      @backdropclick="() => (isOpened = false)"
    >
      <k-page class="no-safe-areas-top no-safe-areas-bottom">
        <k-navbar>
          <template #title>
            <div class="flex items-center">
              <Avatar name="Booom" :size="20" /> 
              <div class="mx-2 text-base font-semibold">
                Welcome
              </div>
            </div>
            
          </template>
          <template #right>
            <k-link navbar @click="() => (isOpened = false)">
              Close
            </k-link>
          </template>
        </k-navbar>
        <k-block class="space-y-4">
            <div class="flex flex-col justify-between">
              <div>
                <k-list>
                  <template v-for="(item, index) in sidenav" :key="index">
                    <k-list-item :title="item.title" class="cursor-pointer">
                      <template #media>
                        <Icon 
                          :name="item.icon" 
                          :size="24" 
                          class="k-color-botfi-primary"
                        />
                      </template>
                    </k-list-item>
                  </template>
                </k-list>
              </div>
            </div>
        </k-block>
      </k-page>
    </k-panel>
</template>