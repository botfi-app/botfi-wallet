<script setup>
import { ref } from 'vue';
import AccountSelectModal from '../modals/AccountSelectModal.vue';

const inputFocused = ref(false)

</script>
<template>
    <div class="addr-bar d-flex align-items-center px-2 pt-3">
        <div class="d-flex w-full flex-grow-1">
            <input 
                class="w-full addr-input form-control" 
                @focus="inputFocused = true"
                @blur="inputFocused = false"
            />
            <div :class="`center-vh input-btns ${inputFocused ? 'input-focused': ''}`">
                <a href="#" class="btn btn-none p-0 text-warning">
                    <Icon name="solar:copy-bold-duotone" />
                </a>
                <a href="#" class="ms-1 btn btn-none p-0">
                    <Icon name="carbon:close-filled" />
                </a>
            </div>
        </div>
        <div class="addr-bar-btns">
            <AccountSelectModal btnClass="net-select px-2" />
        </div>
    </div>
</template>
<style lang="scss">
.addr-bar {
    padding: 5px;

    .input-btns {
        display: none;
        position: absolute;
        right: 65px;
        margin-top: 7px;
        margin-right: 4px;

        &.input-focused {
            display: flex;
        }
    }

    .addr-input {
        background: var(--bs-body-bg-dark-6);
        height: 45px;
        border-radius: 20px;
        font-size: 14px;
        padding-right: 60px;

        &:focus {
            background: var(--bs-body-bg-dark-3);
            .input-btns { visibility: visible; }
        }
    }
}
</style>