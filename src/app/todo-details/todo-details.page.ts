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
  private todoSubtask :string;
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
          try {
            this.items['created']   = val['0']['created'];
            this.items['text']      = val['0']['text'];
            this.items['dueDate']   = val['0']['dueDate'];
            this.items['remindAt']  = val['0']['remindAt']; 
            this.items['note']      = val['0']['note'];
            this.items['comments']  = val['0']['comments'];
            this.items['subTasks']  = val['0']['subTasks'];
            // Models
            this.todoCal      = this.items['dueDate'];
            var time          = new Date(this.items['remindAt'].toDate());
            this.todoTime     = time.toLocaleString();
            this.todoNote     = this.items['note'];
            this.todoSubtask  = this.items['subTasks'];
          }
          catch(err) {
            return;
          }    
        }); 
    });  
  } 

  // Update todo Name
  updateTodo(){ 
    let todoName = this.todoName;
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).update({
      text: this.todoName
    }).then(()=>{
      this.crudMsgs("Updated")
    }); 
  }

  completed(item){
    this.moveItem(item,'done');
  }

  moveItem(item, list: string){
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+item.id).delete();
    let id = item.id;
    delete item.id;
    this.db.collection('users/'+this.afAuth.auth.currentUser.uid+'/'+list, ref=>{
      return ref.orderBy('pos','desc').limit(1);
    }).get().toPromise().then(qSnap=>{
      item.pos = 0;
      qSnap.forEach(a=>{
        item.pos = a.data().pos + 1;
      });
      Object.setPrototypeOf(item, Object.prototype); // array to Object
      this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+list+'/'+id).set(item);
    });
    this.moveToList(list);
    this.router.navigateByUrl('');  
  }

  async moveToList(path:string) {
    const toast = await this.toastCtrl.create({
      message: 'Moved to ' + path,
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'Ok',
    });
    toast.present();
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
      remindAt:  time  
    }, {merge: true}); 
  } 

  updateTodoNote(){
    return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      note : this.todoNote
    }, {merge: true}); 
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
      this.todoComment = null; 
    });
  }

  deleteComment(indexComment,itemId?){  
    var deletecomments = this.items['comments'].splice(indexComment,1); 
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      comments : this.items['comments']
    }, {merge: true});  
  }

  addSubtask(){

    console.info();
    if(this.todoSubtask == undefined)
      return
    if(!this.todoSubtask.trim().length)
      return
    
    var subTask = [{
      "content"   : this.todoSubtask,
      "status"    : false,
      "pos"       : this.items['subTasks'].length ? this.items['subTasks'].length: 0,
    }];
     
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      subTasks : this.items['subTasks'].concat(subTask)
    }, {merge: true}); 
    this.todoSubtask = null;  
  }

  deleteSubtask(subtaskIndex,itemId){
    this.items['subTasks'].splice(subtaskIndex,1); 
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      subTasks : this.items['subTasks']
    }, {merge: true});  
  }


  async deleteTodo(itemId){
    let alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete this Todo ?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+itemId).delete();
            this.crudMsgs("Deleted");  
            this.router.navigateByUrl('');   
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

  async crudMsgs(msg:string) {
    const toast = await this.toastCtrl.create({
      message: msg + ' successfully.',
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'Ok',
    });
    toast.present();
  }
}
