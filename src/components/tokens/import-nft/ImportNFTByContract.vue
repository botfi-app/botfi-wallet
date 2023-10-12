<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../../classes/Utils';
import { useNetworks } from '../../../composables/useNetworks';
import { useNFT } from '../../../composables/useNFT';
import { useRouter } from 'vue-router';

const contractAddr = ref("")
const tokenId = ref(null)
const networks  = useNetworks()
const activeNetInfo = ref()
const router = useRouter()

onBeforeMount(async () => {
    activeNetInfo.value = await networks.getActiveNetworkInfo()
})

const onSubmit = async () => {

}
</script>
<template>
       <div class="mx-3 mt-4">
        <div class="form-floating mb-3 rounded">
            <input 
                type="text" 
                v-model="contractAddr"
                class="form-control rounded" 
                id="contract" 
                placeholder="0x0.."
                :autocapitalize="false"
                :autocomplete="false"
                :autocorrect="false"
            />
            <label for="contract">Contract Address</label>
        </div>
        <div class="form-floating mb-3 rounded">
            <input 
                type="number" 
                v-model="tokenId"
                class="form-control rounded" 
                id="tokenId" 
                placeholder="eg. 1"
                :autocapitalize="false"
                :autocomplete="false"
                :autocorrect="false"
            />
            <label for="tokenId">Token Id</label>
        </div>
        <div>
            <button class="btn btn-primary rounded-pill w-full"
                @click.prevent="onSubmit"
            >
                Import 
            </button>
        </div>
    </div>
</template>