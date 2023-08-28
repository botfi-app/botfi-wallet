<template>
    <Teleport to="body">
        <div id="main-toast" 
            ref="mainToast"
            class="toast align-items-center mx-2"
            style="visibility: hidden;" 
            role="alert" 
            aria-live="polite"
            aria-atomic="true"
            ata-bs-delay="3_000"
        >
            <div class="d-flex p-2 rounded shadow">
                <div class="toast-body fw-bold"></div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </Teleport>
</template>
<style lang="scss">
#main-toast {
    position: fixed;
    bottom: 10px !important;
    left: 0px;
    right: 0px;
    z-index: 9999 !important;
    background: var(--bs-body-bg);

    > div {
        padding: 10px;
        background: rgba(0,0,0, 0.5);

        .toast-body {
            color: rgba(255,255, 255, 0.8) !important;
        }
    }
}
</style>