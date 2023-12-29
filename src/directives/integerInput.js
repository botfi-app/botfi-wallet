
export default (el, binding) => {

   // console.log("el====>>?", el)

    el.addEventListener("keydown", (e) => {

        //console.log("e===>", e)

        let k = e.key.toString().toLowerCase()
        
        if (e.ctrlKey || e.metaKey || ["backspace", "enter", "delete"].includes(k)) {
            return true
        }

        if(!/^([0-9]+)$/.test(k)){
            e.preventDefault()
            return false;
        }

        return true
    })

    el.addEventListener("change", fixIntegerInput);
    el.addEventListener("blur",   fixIntegerInput);
    el.addEventListener("paste",  () => {
        window.setTimeout(() => {
            el.dispatchEvent(new Event('change'));
        },100)
    });

}

const fixIntegerInput = (e) => {
        
    let v = e.target.value.toString().trim();

    if(v == ""){
        return true
    }

    if(!/^([0-9]+)$/.test(v)){
        e.target.value  = v.replace(/[^0-9]+/g, '').trim()
    }

    e.target.dispatchEvent(new Event('input',  { bubbles: true }));

    return true
}