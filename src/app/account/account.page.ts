import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, LoadingController } from '@ionic/angular';
 

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
        this.LogOut();
      });
    });
  }

  async presentLoading() { 
    const loadingElement = await this.loadingController.create({
      message: 'Reseting Your password...',
      spinner: 'crescent',
      duration: 2000
    });
    return await loadingElement.present();
  } 
}
