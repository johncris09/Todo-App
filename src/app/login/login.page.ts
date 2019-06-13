import { Component, OnInit } from '@angular/core'; 

import { AngularFireModule } from '@angular/fire';  
import { GooglePlus } from '@ionic-native/google-plus/ngx';  
import * as firebase from 'firebase/app';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

import { LoadingController } from '@ionic/angular';

import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user: any = {};
  constructor(
  	public googlePlus: GooglePlus,
  	private fb: Facebook,
  	public loadingController: LoadingController,
  	public router: Router,
  	private nativeStorage: NativeStorage,

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

  async facebookLogin(){ 
	  const loading = await this.loadingController.create({
			message: 'Please wait...'
		});
		this.presentLoading(loading);
		let permissions = new Array<string>();

		//the permissions your facebook app needs from the user
		permissions = ["public_profile", "email"];

		this.fb.login(permissions)
		.then(response =>{
			let userId = response.authResponse.userID;

			//Getting name and gender properties
			this.fb.api("/me?fields=name,email", permissions)
			.then(user =>{
				user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
				//now we have the users info, let's save it in the NativeStorage
				this.nativeStorage.setItem('facebook_user',
				{
					name: user.name,
					email: user.email,
					picture: user.picture
				})
				.then(() =>{
					this.router.navigateByUrl('/tabs');
					loading.dismiss();
				}, error =>{
					console.log(error);
					loading.dismiss();
				})
			})
		}, error =>{
			console.log(error);
			loading.dismiss();
		});
	}

	async presentLoading(loading) {
		return await loading.present();
	}																			

}
