import tinycolor from "tinycolor2";
import TelegramCore from "../classes/bots/TelegramCore";
import EventBus from "../classes/EventBus"

export default {
    install: (app, options={}) => {

        let { router } = options;
        
        ///ensureTelegramClient()

        router.beforeResolve((to, from, next) => {

            if(to.fullPath.startsWith("/error")) next()

            if(!ensureTelegramClient()){
                return false;
            }

            next();
        });

        //console.log("window.location.pathname===>", window.location.pathname)

        if(window.location.pathname.startsWith("/error")) return true;
        
        let telegram = window.Telegram;
        let webApp = telegram.WebApp


        setColors(webApp)

        webApp.onEvent("themeChanged", () => setColors(webApp))

        webApp.onEvent("viewportChanged", () => {
           window.setTimeout(() => EventBus.emit("app_expanded", webApp.isExpanded), 100)
        })


        let botUtils = (new TelegramCore(telegram))

        window.botUtils = botUtils;

        // reset the native bottom nav 
        let natBtn = botUtils.mainButton({text: "none", onClick: null })
        
        if(natBtn.isSupported()){
            natBtn.destroy()
        }

        app.provide("botUtils", botUtils)
    }

  }

const ensureTelegramClient = () => {

    if(window.location.pathname.startsWith("/error")){
        return true;
    }

    if(!("Telegram" in window)) {
        window.location = "/error/unknown-client"
        return false;
    }

    let t = window.Telegram;
    let webApp = t.WebApp || null

    if(!webApp || !webApp.initData || webApp.initData == ''){
        window.location = "/error/bad-telegram-client"
        return false
    }

    //finally 
    if(!webApp.initDataUnsafe || 
        Object.keys(webApp.initDataUnsafe).length == 0 ||
        !webApp.initDataUnsafe.user || 
        webApp.initDataUnsafe.user.id.toString() == ''
    ){
        window.location = "/error/unknown-telegram-client"
        return false
    }

    return true;

  }

  const setColors = (webApp) => {

    let scheme = webApp.colorScheme;
    
    let root = document.querySelector(":root")
    let rs = root.style;
    
    root.setAttribute('data-bs-theme', scheme);
    
    let schemeStyle = document.querySelector(`:root[data-bs-theme=${scheme}]`)
    let ss = schemeStyle.style

    //console.log("schemeStyle===>", schemeStyle)

    let colors = webApp.themeParams || {}

    const setCssVar = (name, value) => {
        //console.log(`--${name}: `, value)
        rs.setProperty(`--${name}`, value)
        ss.setProperty(`--${name}`, value)
    }

    const darkenColor = (color, darkLevel, alphaLevel=null) => {
        
        if(!(color instanceof tinycolor)){
            color = tinycolor(color.toString())
        }

        //console.log("color==>", color)

        let c = color.clone().darken(darkLevel)

        if(alphaLevel == null) {
            return c.toHexString()
        } else {
           return c.setAlpha(alphaLevel).toRgbString()
        }
    }

    //lets get the colors 
    let bgColor      = colors.bg_color || "";
    let secondaryBgColor  =  colors.secondary_bg_color || ""
    let textColor    = colors.text_color || ""
    let linkColor   = colors.link_color || ""
    let hintColor   = colors.hint_color || ""
    let primaryBtnColor = colors.button_color || ""
    let primaryBtnText = colors.button_text_color || ""

    let cssStyles = ""
    let cssVars = []


    if(linkColor != ''){
        cssVars.push(["bs-link-color", linkColor])
    }

    if(primaryBtnColor != ''){

        let pRGB = tinycolor(primaryBtnColor).toRgb()

        cssVars.push(['bs-primary-rgb', `${pRGB.r}, ${pRGB.g}, ${pRGB.b}`])
        cssVars.push(['bs-primary', tinycolor(primaryBtnColor).toHexString()])
        cssVars.push(['bs-primary-soft', tinycolor(primaryBtnColor).lighten(10).toHexString()])
        cssVars.push(['bs-primary-dark', tinycolor(primaryBtnColor).darken(10).toHexString()])
        cssVars.push(["bs-btn-color", primaryBtnColor])
        cssVars.push(["bs-btn-color-rgb", tinycolor(primaryBtnColor).toRgbString()])
        cssVars.push(["bs-btn-border-color",  primaryBtnColor])

        cssStyles += `
            .btn-outline-primary {
                --bs-btn-color: ${primaryBtnColor};
                --bs-btn-border-color: ${primaryBtnColor};
                --bs-btn-hover-bg: ${primaryBtnColor};
                --bs-btn-hover-border-color: ${primaryBtnColor};
                --bs-btn-active-bg: ${primaryBtnColor};
                --bs-btn-active-border-color: ${primaryBtnColor};
            }
        `
    }

    if(primaryBtnText != ''){
            cssVars.push(['bs-primary-text',  primaryBtnColor]);
            cssStyles += ` .text-primary { color: ${primaryBtnColor} !important; }
        }`
    }

    if(bgColor != ''){

        let _bg = tinycolor(bgColor)
        let _tc = tinycolor(textColor)

        let bgDark2 = _bg.clone().darken(2).toHexString()
        let bgRgb = _bg.clone().toRgb()

        cssVars.push(
            ...[
                ['bs-body-bg', bgColor],
                ["bs-body-bg-rgb", `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}`],
                ["bs-body-color", textColor],
                ["bs-body-color-rgb", _tc.toRgbString() ],
                ['bs-modal-bg', bgDark2],
                ['bs-card-bg',  bgDark2],
                ['bs-bg-dark-5', _bg.clone().darken(5).toHexString()]
            ]
        )
        
        Array.from(Array(20).keys()).forEach((i)=> {
            
            if(i == 0) return;

            let colorDark = _bg.clone().darken(i).toHexString()
            let lightColor = _bg.clone().lighten(i).toHexString()

            cssVars.push([`bs-body-bg-dark-${i}`, colorDark])
            cssVars.push([`bs-body-bg-light-${i}`, lightColor])
        })
    
        
        if(scheme == 'dark'){
            cssStyles += `
                .swal2-popup {
                    background: ${darkenColor(_bg, 2, 0.98)} !important;
                    color: ${textColor};
                }

                .swal2-backdrop-show { 
                    background: ${darkenColor(_bg, 50, 0.4)} !important;
                }
                
            `
        }

        if(scheme == 'dark'){

            let border = _bg.clone().lighten(3).setAlpha(0.9).toRgbString()

            cssStyles += `
                .form-control, .form-check-input {
                    border: 2px solid ${border};
                }
            `
            cssVars.push(...[
                [ "bs-border-color", border ], 
                ["bs-border-color-translucent", _bg.clone().lighten(3).setAlpha(0.175).toRgbString()]
            ])

        } else {

            let border = darkenColor(_bg, 6, 0.9)

            cssStyles += `
                .form-control, .form-check-input { 
                    border: 2px solid ${border};
                }
            `

            cssVars.push(...[
                ["bs-border-color", border ],
                ["bs-border-color-translucent", darkenColor(_bg, 6, 0.175)]
            ])
        }

        cssStyles += `
            .bg-darken3-alpha { 
                background: ${darkenColor(_bg, 3, 0.9)} !important;
                color: ${textColor} !important;
            }
        `
    }

    

    if(secondaryBgColor != ''){

        let sBgColor = tinycolor(secondaryBgColor)
        let sTextColor = (sBgColor.isDark()) ? sBgColor.lighten(95) : sBgColor.darken(90)

        cssVars.push(...[
            ["bs-secondary-bg", secondaryBgColor],
            ["bs-secondary-bg-rgb", sBgColor.toRgbString()],
            ["bs-secondary-color", sTextColor.toHexString()],
            ["bs-secondary-color-rgb", sTextColor.toRgbString()]
        ])

    }

    if(linkColor != ""){
        cssVars.push(...[
            ["bs-link-color", linkColor],
            ["bs-link-color-rgb", tinycolor(linkColor).toRgbString()]
        ])
    }

    if(hintColor != ''){
        cssStyles += `.hint { color: ${hintColor} !important; } `
    }

    const setBtnVars = (bgColor, textColor="") => {

        let btn = tinycolor(bgColor) 
        let btnDarken = (level) => darkenColor(btn, level) 

        if(textColor == ""){
            textColor = (btn.isDark())
                        ? btn.clone().lighten(100).toHexString()
                        : btn.clone().darken(100).toHexString()
        }

        return `
            --bs-btn-bg: ${bgColor};
            --bs-btn-color: ${textColor};
            --bs-btn-border-color: ${btnDarken(2)};
            --bs-btn-hover-bg: ${btnDarken(5)};
            --bs-btn-hover-border-color: ${btnDarken(7)};
            --bs-btn-focus-shadow-rgb:  ${btnDarken(60)};
            --bs-btn-active-bg: ${btnDarken(10)};
            --bs-btn-active-bg: ${btnDarken(12)};
            --bs-btn-disabled-bg: ${btnDarken(20)};
            --bs-btn-disabled-border-color: ${btnDarken(22)};
        `
    }

    //lets get the primary btn 
    if(primaryBtnColor != ''){

        let pbtn = tinycolor(primaryBtnColor)

        cssVars.push(["bs-primary", primaryBtnColor])

        cssStyles += `
            .btn-primary {
                ${setBtnVars(primaryBtnColor, primaryBtnText)}
            }

            .form-check-input:checked { 
                background-color: ${darkenColor(pbtn, 2)} !important;
                border-color: ${pbtn.clone().toHexString()} !important;
            }

            .form-check-input:focus {
                border-color: ${pbtn.clone().lighten(10).toHexString()} !important;
                box-shadow: 0 0 0 0.25rem ${pbtn.clone().setAlpha(0.25).toRgbString()} !important;
            }

            .form-control:focus {
                border-color: ${pbtn.clone().lighten(10).setAlpha(0.9).toRgbString()} !important;
                box-shadow: 0 0 0 0.25rem ${pbtn.clone().setAlpha(0.25).toRgbString()} !important;
            }
        `


        cssStyles += `
            .btn-secondary {
                ${setBtnVars(tinycolor(primaryBtnColor).complement().toHexString())}
            }
        `
        
    }
    
    /// set css vars
    cssVars.forEach(async (itemArray) => setCssVar(itemArray[0], itemArray[1]))
    
    if(cssStyles != ""){
        setCssStyle(cssStyles)
    }
}

const setCssStyle = (text) => {
   let  s = document.createElement("style")
   s.textContent = text;
   document.head.appendChild(s)
}