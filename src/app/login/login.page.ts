import { Component, OnInit } from '@angular/core'; 

import { AngularFireModule } from '@angular/fire';  
import { GooglePlus } from '@ionic-native/google-plus/ngx';  
import * as firebase from 'firebase/app';
 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user: any = {};
  constructor(
  	public googlePlus: GooglePlus,

  ) { }

  ngOnInit() {
  }
 
  googleplusLogin(){
  	this.googlePlus.login({
  	  'webClientId': '1047252692996-jch521c4gouebt4l42re3dslb40jasp1.apps.googleusercontent.com',
  	  'offline' : true, 
  	}).then(res=>{
  		firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken)).then(suc=>{
  		  console.log("Login Success");
  		}).catch(err=>{
  		  console.log('faile to login');
  		})
  	});
  }

  facebookLogin(){ 
  	let provider = new firebase.auth.FacebookAuthProvider();

  	firebase.auth().signInWithRedirect(provider).then(()=>{
  	  firebase.auth().getRedirectResult().then((result)=>{
  	  	alert(JSON.stringify(result));
  	  }).catch(function(error) {
  	  	alert(JSON.stringify(error));
  	  });
  	});
  }

}
