import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, LoadingController } from '@ionic/angular';  
import { Facebook } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {

  user: any = {}; 

  constructor(
    private afAuth: AngularFireAuth ,
    private afs : AngularFirestore, 
    private alertController: AlertController,
    private loadingController: LoadingController,
    private fb: Facebook,
  ) {  
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user;  
      }        
      this.user.profilePic = this.user.photoURL == null ?  'https://img.icons8.com/office/480/000000/user.png' : this.user.photoURL+'?type=large';  
    });
  }

  ngOnInit() {
  }

  LogOut(){  
    this.afAuth.auth.signOut().then(()=>{
      location.reload();
    });
  } 

  resetPassword(){
    this.afAuth.auth.sendPasswordResetEmail(this.user.email).then(()=>{
      this.presentLoading().then(()=>{
        setTimeout(() => {
          this.emailSent();
        }, 2100);
      });
    });  
  }

  isLoading = false;
  async presentLoading() { 
    this.isLoading = true;
    return await this.loadingController.create({
      message: 'Please wait...',
      spinner: 'crescent',
      duration: 2000,
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }  
  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }

  async emailSent(){ 
    let alert = await this.alertController.create({
      header: 'Email Sent',
      message: 'Navigate to your email to change your password. <br/><br/> <br/>  Do you want to Logout?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            this.LogOut();
          }
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => { 
          }
        }
      ]
    });
    alert.present(); 
  }
}
