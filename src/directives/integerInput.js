
export default (el, binding) => {

   // console.log("el====>>?", el)

    el.addEventListener("keypress", (e) => {

        //console.log("e===>", e)

        if(!/^([0-9]+)$/.test(e.key)){
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