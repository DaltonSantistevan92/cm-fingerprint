import { Injectable } from '@angular/core';

import { AlertController, ToastController, NavController } from '@ionic/angular';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { StorageService } from './storage.service';

//import { Plugins } from '@capacitor/core';
//const { Device } = Plugins;

import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor(
    private alertCtrl: AlertController,
    private storage: StorageService,
    private toastController: ToastController,
    private navCtrl: NavController,
    private faio: FingerprintAIO
  ) { }


  public async setPass() {
    const alert = await this.alertCtrl.create({
      header: 'Configurar la clave',
      subHeader: 'Por favor establezca su contraseña',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async () => { }
        }, {
          text: 'Confirm',
          handler: async (pass) => {
            let { password } = pass;
            await this.storage.set('user_pass', password)
            this.toastInfo("Ahora puede iniciar sesión, haga clic en BLOQUEAR nuevamente")
          }
        }
      ]
    });
    await alert.present().then(() => {
      const password: any = document.querySelector('ion-alert input');
      password.focus();
      return;
    });

  }

  public async checkPass() {
    const alert = await this.alertCtrl.create({
      header: 'LOGIN',
      subHeader: 'Por favor, introduzca su contraseña',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async () => { }
        }, {
          text: 'Confirm',
          handler: async (pass) => {
            let { password } = pass;
            let res = await this.storage.get('user_pass');
            if (res == password) {
              try {
                const device = await Device.getInfo();
                if (device.platform != "web") {
                  this.faio.isAvailable().then((result: any) => {
                    this.ConfirmAIO() //Test if this phone have Biometric Hardware
                  })
                } else this.toastInfo("La biometría no está activada, use el emulador para usar esta función de inicio de sesión")

              } catch (error) { }
              this.navCtrl.navigateForward('/home', { animated: true })
            } else this.toastError("Error de contraseña")

          }
        }
      ]
    });
    await alert.present().then(() => {
      const password: any = document.querySelector('ion-alert input');
      password.focus();
      return;
    });
  }

  private async ConfirmAIO() {
    const alert = await this.alertCtrl.create({
      header: 'Usar identificación',
      message: '¿Desea utilizar la autenticación biométrica?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'primary',
          handler: async (c) => { }
        }, {
          text: 'Yes',
          handler: async (o) => {
            await this.storage.set('biometric', "true");
            this.toastInfo("Ahora puedes usar biométrico")
          }
        }
      ]
    });

    await alert.present();
  }

  public async toastInfo(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'primary',
      animated: true,
      position: 'bottom'
    });
    toast.present();
  }

  private async toastError(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'danger',
      animated: true,
      position: 'bottom'
    });
    toast.present();
  }

  public async fingerPrintAIO() {

    this.faio.isAvailable().then((result: any) => {
      this.faio.show({
        title: 'Autenticación biométrica',
        subtitle: 'Por favor conectarse',
        disableBackup: true,
      }).then((res: any) => {
        this.navCtrl.navigateForward('/home', { animated: true })
        return true
      }).catch((error: any) => {
        this.toastError(error.message)
        return false
      })
    }).catch((error: any) => {
      this.toastError("Este teléfono no tiene hardware biométrico o está desactivado, verifíquelo")
    });


  }
}
