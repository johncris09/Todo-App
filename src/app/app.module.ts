import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { LoginPage } from './login/login.page';
import { LoginPageModule } from './login/login.module';
import { TabsPageModule } from './tabs/tabs.module'; 
import { TodoDetailsPageModule } from './todo-details/todo-details.module';
import { TodoPage } from './todo/todo.page';
import { TodoDetailsPage } from './todo-details/todo-details.page';


import { OrderModule } from 'ngx-order-pipe';

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
    OrderModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
