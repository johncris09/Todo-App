import { Component, OnInit, Input} from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { post } from 'selenium-webdriver/http';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {
  
  items = []; 
  @Input('name') name: string;
  private todoName: string;
  private todoCal: string;
  private todoTime: string;
  private todoNote: string;
  private todoComment: string;
  comment = [];
  user: any = {};


  constructor( 
    public activeRoute: ActivatedRoute,
    private afAuth:  AngularFireAuth,
    private db: AngularFirestore,
    private alertCtrl : AlertController, 
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,  
    private router: Router, 
    public navCtrl: NavController,
  ){}

  ngOnInit() {
    let getAllParams  = this.activeRoute.snapshot.params;
    this.name         = getAllParams.path;
    this.items['id']  = getAllParams.id;
    this.items['pos'] = getAllParams.pos;

    this.afAuth.authState.subscribe(user=>{
      if(!user)
        return;
      this.db.collection('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name,
        ref => ref.where('pos','==',parseInt(this.items['pos'])),
      )
        .valueChanges()
        .subscribe(val => {
          console.info(val[0]['comments'][0]);

          this.items['created']   = val['0']['created'];
          this.items['text']      = val['0']['text'];
          this.items['dueDate']   = val['0']['dueDate'];
          this.items['remindAt']  = val['0']['remindAt']; 
          this.items['note']      = val['0']['note'];
          this.items['comments']  = val['0']['comments'];
          this.items['subTasks']  = val['0']['subTasks']; 

          // Models
          this.todoCal    = this.items['dueDate'];
          this.todoTime   = this.items['remindAt'];
          this.todoNote   = this.items['note']; 
        });
      
    });  
  } 

  updateTodo(item?){ 
    let todoName = this.todoName;
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      text: todoName
    }, {merge: true});
    
  }

  updateTodoCal(){ 
    var date = new Date(this.todoCal);
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      dueDate: (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear()
    }, {merge: true}); 
    
  }       
    
  // need to fix
  updateTodoTime(){
    var time = new Date(this.todoTime); 
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      remindAt: time.getHours()  + '-' + time.getMinutes() + '-' + time.getSeconds() 
    }, {merge: true}); 
  } 

  updateTodoNote(){
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      note : this.todoNote
    }, {merge: true}); 
  }

  showItem(){
    this.todoTime = this.items['remindAt'];
  }

  // adding comment
  addComment(){  
    let now = new Date();
    let nowUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(), 
        now.getUTCHours(), 
        now.getUTCMinutes(), 
        now.getUTCSeconds()
      )
    );

    // getting the user info
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user;
      } 
      var comment = [{
        "comment"   : this.todoComment,
        "date"      : nowUtc,
        "commentor" : this.user.displayName
      }];
      this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
        comments : this.items['comments'].concat(comment)
      }, {merge: true});  
    });
  }

}
