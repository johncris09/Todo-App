import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
 

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {

  user: any = {};
  profile;

  constructor(
    private afAuth: AngularFireAuth ,
    private afs : AngularFirestore, 
  ) {  
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user;
        this.profile = user.photoURL;
      } 
      console.info(user);
      console.info(this.profile+"?type=large");

      // console.info(user.photoURL);
    });
  }

  ngOnInit() {
  }

  LogOut(){ 
    // Uri xx = FirebaseAuth.getInstance().getCurrentUser().getPhotoUrl();
    this.afAuth.auth.signOut().then(()=>{
      location.reload();
    });
  } 
}
