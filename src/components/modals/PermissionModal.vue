<script setup>
import { nextTick, ref, watch } from 'vue';
import { Modal as bsModal } from 'bootstrap';
import { usePermission } from "../../composables/usePermission"

const permManager = usePermission()

const id = ref("permission_modal")
const title = ref("")
const text  = ref("")
const warningText = ref("")
const extraParams = ref([])
const method = ref(null)

const emits = defineEmits(["show", "hide"])

const isOpened = ref(null)
const isConfirmed = ref(false)


const  show = async ({
    title:          _title          = "",
    text:           _text           = "",
    extraParams:    _extraParams    = [],
    warningText:    _warningText    = "",
    method:         _method         = ""
}) => {

    title.value           = _title;
    text.value            = _text;
    extraParams.value     = _extraParams;
    warningText.value     = _warningText
    method.value          = _method

    bsModal.getInstance("#"+id.value).show()

    isOpened.value = true

    return (new Promise((resolve, reject) => {
        let intval = setInterval(() => {
            if(isOpened.value != null && isOpened.value == false){
                
                resolve({
                    isConfirmed: isConfirmed.value,
                    isRejected: !isConfirmed.value
                });

                clearInterval(intval)
            }
        },100)
    }))
}

const  hide = () => {
    nextTick(() =>{
        bsModal.getInstance("#"+id.value).hide()
    })
}


defineExpose({show, hide})

const onShow = () => {
    
    isOpened.value = true 
    
    //confirm btns 
    isConfirmed.value = false

    emits('show')
}

const onHide = () => {
    isOpened.value = false 
    emits('hide')
}

const handleApproveBtn = async () => {
    isConfirmed.value = true 

    hide()
}

const handleRejectBtn = () => {
    isConfirmed.value = false 
    hide()
}
</script>
<template>
    <Modal
        :id="id"
        title=""
        :has-header="false"
        :has-footer="false"
        size="modal-lg modal-dialog-centered w-100 perm-modal"
        @show="onShow"
        @hide="onHide"
    >   
        <template #body>
            <div class="p-4 text-center">
                <div class="center-vh">
                    <Icon 
                        name="mynaui:info-hexagon" 
                        class="text-success" 
                        :size="60"
                    />
                </div>
                <div class="my-2  my-3" v-if="title != ''">
                    <h4> {{ title }}</h4>
                </div>

                <p v-if="text != ''" 
                    class="my-2 mt-4"
                    v-html="text"
                />

                <p v-if="warningText != ''" 
                    class="text-warning"
                    v-html="warningText"
                />

                <div class="mt-4 center-vh">
                    <div class="px-1">
                        <button class="btn btn-success p-3 w-full rounded-lg"
                            @click.prevent="handleApproveBtn"
                        >
                            Approve
                        </button>
                    </div>
                    <div class="px-1">
                        <button class="btn btn-danger p-3 w-full rounded-lg"
                            @click.prevent="handleRejectBtn"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>
<style lang="scss">

</style>