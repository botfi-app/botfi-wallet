import { startApp } from "./main_core"
import capacitorPlugin from "./plugins/capacitor"
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
//import { SplashScreen } from '@capacitor/splash-screen';

//SplashScreen.show()

FirebaseCrashlytics.setEnabled({enabled: true})

startApp({ capacitor: capacitorPlugin})

//SplashScreen.hide()
