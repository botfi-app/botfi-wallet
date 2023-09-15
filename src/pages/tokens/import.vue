<script setup>
import 'bootstrap/js/src/tab'
</script>
<template>
    <WalletLayout
        title="Import Tokens"
        :show-nav="false"
    >   

        <NativeBackBtn />

        <div class="w-400 mb-5">
            <div class="d-flex p-2 align-items-center justify-content-between flex-nowrap">
                <div class="fw-semibold fs-6 pe-2">Import Token</div>
                <div class="ps-2">
                    <DefaultNetAndWallet 
                        :showAddr="false"
                        net-max-width="100px"
                    />
                </div>
            </div>
            <ul class="nav nav-underline nav-fill" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" 
                        :aria-selected="true"                    
                        href="#"
                        data-bs-toggle="pill" 
                        data-bs-target="#p-search-token" 
                        type="button" 
                        role="tab"
                    >
                        Search
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" 
                        href="#"
                        :aria-selected="false"
                        data-bs-toggle="pill" 
                        data-bs-target="#p-custom-token" 
                        type="button" 
                        role="tab"
                    >
                        Custom Token
                    </a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="p-search-token" role="tabpanel">
                    Search Token
                </div>
                <div class="tab-pane fade" id="p-custom-token" role="tabpanel">
                    Custom Token
                </div>
            </div>

        </div>
    </WalletLayout>
</template>