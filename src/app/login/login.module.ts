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
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: [
        'https://www.googleapis.com/auth/contacts.readonly'
      ],
      customParameters: {
        // Forces account selection even when one account
        // is available.
        prompt: 'select_account'
      }
    },
    {
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      scopes: [
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ],
      customParameters: {
        // Forces password re-entry.
        auth_type: 'reauthenticate'
      }
    },
    firebase.auth.TwitterAuthProvider.PROVIDER_ID, // Twitter does not support scopes.
    firebase.auth.EmailAuthProvider.PROVIDER_ID // Other providers don't need to be given as object.
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
