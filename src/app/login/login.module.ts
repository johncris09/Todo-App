import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router'; 
import { IonicModule } from '@ionic/angular';  
import { LoginPage } from './login.page'; 
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';
import { AngularFireAuthModule } from '@angular/fire/auth';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'redirect', // popup                                                                                                                                                          
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, 
    },
     
  ],
  tosUrl: '/tos',
  privacyPolicyUrl: '/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};


const routes: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,  
    IonicModule,
    RouterModule.forChild(routes),
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AngularFireAuthModule, 
  ], 
  providers: [],
  declarations: [LoginPage],
  entryComponents: [LoginPage],
})
export class LoginPageModule {}
