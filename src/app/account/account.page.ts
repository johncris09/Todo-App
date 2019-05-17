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

  constructor(
    private afAuth: AngularFireAuth ,
    private afs : AngularFirestore, 
  ) {  
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user;
      } 
      console.info(user);
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
