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
  
  items = <any>[]; 
  @Input('name') name: string;
  public todoName: string;
  public todoCal: string;
  public todoTime: string;
  public todoNote: string;
  public todoComment: string;
  public todoSubtask :string;
  public todoListSubtask: string;
  comment = [];
  user: any = {};
  public alertPresented: any;

  constructor( 
    public activeRoute: ActivatedRoute,
    private afAuth:  AngularFireAuth,
    private db: AngularFirestore,
    private alertCtrl : AlertController, 
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,  
    private router: Router, 
    public navCtrl: NavController,
  ){
    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.user = user; 
      }
      this.user.profilePic = this.user.photoURL == null ?  'https://img.icons8.com/office/480/000000/user.png' : this.user.photoURL+'?type=large'; 
    }); 

    this.alertPresented = false;
  }

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
            this.todoNote     = this.items['note']; 
            if(this.items['remindAt'] != null){
              this.todoTime     = this.items['remindAt'];  
            }  
          }catch(err) {
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
      this.crudMsgs("Updated sucessfully")
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
    var setDue = new Date(this.todoCal);
    var dateNow = new Date();   
    if(this.compareDate(setDue,dateNow)){ 

      return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
        dueDate: (setDue.getMonth() + 1) + '/' + setDue.getDate() + '/' +  setDue.getFullYear()
      }, {merge: true}).then(()=>{
        // this.dateAndTimeReminderMsgs("Due date is set");
      });
    }else{ 
      this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
        dueDate: null
      }, {merge: true}).then(()=>{ 
        this.dateAndTimeReminderMsgs("The set due date must be equal or greater than date now."); 
      });
    }
  }  

  compareDate(setDueDate, dateNow){ 
    var dueOn = new Date(setDueDate.getFullYear(), setDueDate.getMonth() , setDueDate.getDate());
    var now = new Date(dateNow.getFullYear(), dateNow.getMonth() , dateNow.getDate());
    return (dueOn >= now) ? true:  false;  
  }     
     
  updateTodoTime(item?){   
    if(item.dueDate === null){ 
      this.dateAndTimeReminderMsgs("Due date is required."); 
    }else{ 
      if(item.remindAt == null || this.todoTime.length > 8){ 
        var dateTime = new Date(this.todoTime);
        var reminder = dateTime.toLocaleString('en-US', { 
          hour: 'numeric', minute: 'numeric',second: 'numeric', hour12: false 
        }); 
        this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
          remindAt:  reminder 
        }, {merge: true}); 
      }else{  
        this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
          remindAt:  this.todoTime 
        }, {merge: true}); 
      }
    }
  } 
 

  updateTodoNote(){ 
    console.log(this.todoNote);
    if(!this.todoNote.trim().length){
      this.crudMsgs("Note must not be empty "); 
      return;
    }else{
      return this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
        note : this.todoNote
      }, {merge: true}).then(()=>{
        this.crudMsgs("Note updated sucessfully ");
      }); 
    } 
  } 

  // adding comment
  addComment(){   
    if(this.todoComment == undefined){
      this.crudMsgs("Comment must not be empty");
    }else if(!this.todoComment.trim().length){
      this.crudMsgs("Comment must not be empty");
    }else{
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
        }, {merge: true}).then(()=>{
          this.crudMsgs("Comment added successfully ").then(()=>{
            this.todoComment = null; 
          }); 
        });
        
      });
    }
    
  } 


  async deleteComment(indexComment,itemId?, comment?){ 
    let alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete this comment ?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            var deletecomments = this.items['comments'].splice(indexComment,1); 
            this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
              comments : this.items['comments']
            }, {merge: true}).then(()=>{ 
              this.crudMsgs("Deleted successfully");
            });
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


  addSubtask(){  
    if(this.todoSubtask == undefined){
      this.crudMsgs("Subtask must not be empty");
    }else if(this.todoSubtask.trim().length == 0){
      this.crudMsgs("Subtask must not be empty");
    }else{
      var subTask = [{
        "content"   : this.todoSubtask,
        "status"    : false,
        "pos"       : this.items['subTasks'].length ? this.items['subTasks'].length: 0,
      }];
       
      this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
        subTasks : this.items['subTasks'].concat(subTask)
      }, {merge: true}).then(()=>{
        this.crudMsgs("Subtask added successfully")
      }).then(()=>{
        this.todoSubtask = null;
      }); 
    } 
  }

  updateSelectedSubtask(index,subtaskContent){
    this.items['subTasks'][index]['content'] = subtaskContent;
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      subTasks : this.items['subTasks']
    }, {merge: true}).then(()=>{
      this.crudMsgs("Subtask updated successfully")
    }).then(()=>{
      this.todoSubtask = null;
    }); 
  }

  toggleSubtasks(index,subtaskStatus){
    var status = subtaskStatus ? false: true;
    this.items['subTasks'][index]['status'] = status ;
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
      subTasks : this.items['subTasks']
    }, {merge: true}); 
    this.todoSubtask = null;    
  }


  async deleteSubtask(subtaskIndex,itemId, subtask_content?){ 
    let alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete this Subtask "' + subtask_content + '" ?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            this.items['subTasks'].splice(subtaskIndex,1); 
            this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items['id']).set({
              subTasks : this.items['subTasks']
            }, {merge: true}).then(()=>{
              this.crudMsgs("Subtask deleted successfully")
            }).then(()=>{
              this.todoSubtask = null;
            });
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

  async deleteTodo(itemId){
    let alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete this Todo ?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+itemId).delete();
            this.crudMsgs("Deleted successfully.");  
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
      message: msg ,
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'Ok',
    });
    toast.present();
  } 
  

  async dateAndTimeReminderMsgs(msg:string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'Ok',
    });
    toast.present();
   
  }
}
