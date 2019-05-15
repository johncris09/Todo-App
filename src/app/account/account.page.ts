import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})

export class AccountPage implements OnInit {

  user = {};

  constructor(
    private afAuth: AngularFireAuth
  ) { 
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user;
      }
    });
  }

  ngOnInit() {
  }

  LogOut(){
    this.afAuth.auth.signOut().then(()=>{
      location.reload();
    });
  }
}
