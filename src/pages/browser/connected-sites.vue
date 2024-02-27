<route>
    { name: "connected-sites" }
</route>

<script>
  export default {
    name: 'connected-sites'
  }
</script>
<script setup>
import { onActivated, ref } from 'vue';  
import { usePermission } from '../../composables/usePermission';
import Image from '../../components/common/Image.vue';
import Utils from '../../classes/Utils';

const { connectedSites, removeSite } = usePermission();

const parseUrl = (origin) => (new URL(origin))

const removeOrigin = async (origin) => {
   let result = await Utils.showConfirmPopup({
                title: "Confirm Action",
                text: `${parseUrl(origin).hostname} will be removed from authorized sites`
              })

    if(!result.isConfirmed) return;

    await removeSite(origin)          
}
</script>
<template>
    <WalletLayout
       title="Connected Sites"
       :show-nav="true"
       back-url="/browser/menu"
   >   
       <div class="w-800">
          <template v-if="!connectedSites || connectedSites.length == 0">
            <NoResults text="No connected sites" />
          </template> 
          <template v-else>
            <ul class="list-group list-group-flush">
              <template v-for="(value, origin) in connectedSites">
                <li class="list-group-item py-4">
                  <div class="d-flex align-items-start">
                    <Image
                      :src="`${parseUrl(origin).href}/favicon.ico`"
                      :placeholder="parseUrl(origin).host"
                      :width="26"
                      :height="26"
                      class="rounded-circle"
                    />
                    <div class="mx-2 flex-grow-1">
                      <div class="fw-medium fs-14 text-uppercase">
                        {{ parseUrl(origin).hostname }}
                      </div>
                      <div class="fs-12">{{ origin }}</div>
                    </div>
                    
                    <div>
                      <a href="#" class="text-danger" @click.prevent="removeOrigin(origin)">
                        <Icon name="mingcute:delete-line" :size="24" />
                      </a>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
          </template>
        </div>
    </WalletLayout>
</template>