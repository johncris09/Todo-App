import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from 'src/environments/environment'; 
import { LoginPageModule } from './login/login.module';
import { TabsPageModule } from './tabs/tabs.module';  
import { OrderModule } from 'ngx-order-pipe';   
import {IonicGestureConfig} from "./gestures/ionic-gesture-config"; 
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FCM } from '@ionic-native/fcm/ngx';  

import { GooglePlus } from '@ionic-native/google-plus/ngx'; 
import * as firebase from 'firebase/app';

import { Facebook } from '@ionic-native/facebook/ngx';

firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [
    AppComponent 
  ],
  entryComponents: [
    AppComponent 
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    LoginPageModule,
    TabsPageModule,
    OrderModule,    
  ],
  providers: [
    LocalNotifications,
    FCM,  
    GooglePlus,
    Facebook,
    StatusBar,
    SplashScreen, 
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: IonicGestureConfig
    }, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
