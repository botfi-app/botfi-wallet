import { startApp } from "./main_core.js"
//import telegramPlugin from "./plugins/telegram.js"
import capacitorPlugin from "./plugins/capacitor"
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';


FirebaseCrashlytics.setEnabled({enabled: true})

const plugins = {
     //telegram:  telegramPlugin,
     capacitor: capacitorPlugin 
}

startApp(plugins) 

//SplashScreen.hide()
 