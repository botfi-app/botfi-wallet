import { 
    kApp, 
    kPage, 
    kButton, 
    kNavbar, 
    kBlock, 
    kNavbarBackLink,
    kPreloader,
    kListInput,
    kList,
    kBlockTitle,
    kListItem,
    kCheckbox,
    kDialog,
    kDialogButton
} from 'konsta/vue'; 

export default {
    install: async (app, options) => {
        app.component("k-app", kApp)
        .component("k-page", kPage)
        .component("k-button",kButton)
        .component("k-navbar", kNavbar)
        .component("k-block", kBlock)
        .component("k-navbar-back-link", kNavbarBackLink)
        .component("k-preloader", kPreloader)
        .component("k-list-input", kListInput)
        .component("k-list", kList)
        .component("k-block-title", kBlockTitle)
        .component("k-list-item", kListItem)
        .component("k-checkbox", kCheckbox)
        .component("k-dialog", kDialog)
        .component("k-dialog-button", kDialogButton)
    }
}