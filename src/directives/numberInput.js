
export default (el, binding) => {

    el.addEventListener("keydown", (e) => {

        if (e.ctrlKey || e.metaKey || ["backspace", "enter", "delete"].includes(k)) {
            return true
        }

        let v = e.target.value;

        let pattern = (v.includes("."))
                    ? /[0-9]+/g
                    : /[0-9\.]+/g

        if(!pattern.test(e.key)){
            e.preventDefault()
            return false;
        }

        return true
    });

    el.addEventListener("change", fixNumberInput);
    el.addEventListener("blur",   fixNumberInput);
    el.addEventListener("paste",  () => {
        window.setTimeout(() => {
            el.dispatchEvent(new Event('change'));
        },100)
    });
}

const fixNumberInput = (e) => {
        
    let v = e.target.value.toString().trim();

    //console.log("e.target==>", e.target.value)

    if(v == ""){
        return true
    }

    if(!/^((\d+)?(\.{1})?(\d+)?)$/g.test(v)){
        
        let vf = v.replace(/[^0-9\.]+/g, '')
                   .replace(".","_")
                   .replace(/\./g,"")
                   .replace("_", ".")
                   .trim()      
        
        if(vf == ".") vf = "0.0"

        e.target.value = vf
        
        //console.log("vf===>", vf)
    } else if(v == "."){
        e.target.value = "0.0"
    }

    e.target.dispatchEvent(new Event('input',  { bubbles: true }));

    return true
}