import { Component, OnInit, Input} from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

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
          this.items['created'] = val['0']['created'];
          this.items['text'] = val['0']['text'];
          this.items['dueDate'] = val['0']['dueDate'];
          this.items['remindAt'] = val['0']['remindAt']; 

          this.todoCal = this.items['dueDate'];
          this.todoTime = this.items['remindAt'];
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
   
  getFormattedDate(date) { 
    var year  = date.getFullYear(); 
    var month = (1 + date.getMonth()).toString(); 
    month     = month.length > 1 ? month : '0' + month; 
    var day   = date.getDate().toString(); 
    day       = day.length > 1 ? day : '0' + day; 
    return year + '/' + month + '/' + day; 
  } 
  
  updateTodoTime(){
    
  } 

  showItem(){
    
  }
  
}
