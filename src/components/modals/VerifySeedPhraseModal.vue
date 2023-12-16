<script setup>
import { onBeforeMount, ref } from 'vue';
import Utils from '../../classes/Utils';


const p = defineProps({
    data: { type: Array, required: true }
})

const emit = defineEmits(["submit"])

const initialized = ref(false)
const dataKeysArr = ref([])
const formData = ref([])

onBeforeMount(() => {

    let arrKeys = [...Array(p.data.length).keys()]

    //console.log("arrKeys===>",  arrKeys)

    arrKeys.sort(() => Math.random() - 0.5);
    dataKeysArr.value = arrKeys.slice(0, 4)

    initialized.value = true 
})

const  handleSubmit = async () => {

    let fd = formData.value

    if(fd.length != 4){
        return Utils.mAlert(`Verify the `)
    }

    for(let idx in formData.value){

        //idx = parseInt(idx)

        let requiredValKey = dataKeysArr.value[idx]

        console.log("requiredValKey===>", requiredValKey)

        let requiredValue = p.data[requiredValKey]
        let inputData = (formData[idx] || "").trim()

        if(inputData == ""){
            return Utils.mAlert(`Word #${requiredValKey + 1} required`)
        }

        if(requiredValue != inputData){
            return Utils.mAlert("Provided words doesn't match")
        }
    }

   // emit("submit")
}
</script>
<template>
    <Modal
        id="verify_seed_phrase_modal"
        title="Verify"
        :has-header="true"
        :has-footer="false"
    >
        <template #body>
            <div>
                <p class="p-2 pt-3 text-center hint">      
                    To ensure the accuracy of the seed phrase you wrote down, 
                    please provide the words in their respective positions.
                </p>
                <div class="row justify-content-cneter align-items-center mx-1 mb-2">
                    <template v-for="key in dataKeysArr">
                        <div class="col-6 p-1">
                            <div class="form-floating">
                                <input 
                                    type="text" 
                                    v-model="formData[key]"
                                    class="form-control w-full rounded-lg" 
                                    :id="`word_${key}`" 
                                    :placeholder="`Enter word #${key}`"
                                >
                                <label :for="`word_${key}`">
                                    Word #{{ key + 1 }}
                                </label>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="m-2 my-4">
                    <button 
                        @click="handleSubmit"
                        class="btn btn-success w-full rounded-pill"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>