import { Component } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router'; 
import { FCM } from '@ionic-native/fcm/ngx';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireModule } from 'angularfire2';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html' 
})
export class AppComponent {
  loginModal: HTMLIonModalElement;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private router: Router, 
    private fcm: FCM,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide(); 

      this.afAuth.authState.subscribe(user => {
        if(!user){
          
          this.router.navigateByUrl('/login'); 
          

        }else { 
          this.router.navigateByUrl('/tabs');

        }
      });
    });
 
  }
}
