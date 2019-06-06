import { Component, OnInit,  Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ToastController, ModalController, NavController, ActionSheetController } from '@ionic/angular'; 
import { Router } from '@angular/router';

import { LocalNotifications, ELocalNotificationTriggerUnit} from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  items = [];
  @Input('name') name: string;
  @Input('title') title: string;
  @Input('allowDone') allowDone: boolean;
  @Input('allowTodo') allowTodo: boolean;
  @Input('allowLater') allowLater: boolean;
  loading = true;

  public progress: number = 0;
  public pressState: string = "released";

  // Interval function
  protected interval: any;


  constructor(
    private afAuth:  AngularFireAuth,
    private db: AngularFirestore,
    private alertCtrl : AlertController, 
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,  
    private router: Router, 
    public navCtrl: NavController, 
    public actionSheetController: ActionSheetController,  
    private localNotification: LocalNotifications,

  ) { 

    // Setting an alarm
    var Interval = setInterval( () => { 
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December" 
      ];

      var timeNow   = new Date();  
      var alarm     = timeNow.toLocaleString('en-US', { 
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true 
      });  
      for(let counter = 0; counter < this.items.length; counter++){
        var dueon = new Date ( this.items[counter].dueDate + ' ' + this.items[counter].remindAt);
        dueon.setSeconds(0);
        
        // use for condition in alarm
        var reminder = dueon.toLocaleString('en-US', { 
          hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true 
        }); 

        // time with no seconds
        var remindAt = dueon.toLocaleString('en-US', { 
          hour: 'numeric', minute: 'numeric' , hour12: true 
        }); 
 
        var formatDate = months[dueon.getMonth()] + " " + dueon.getDate() + "," +  dueon.getFullYear();
          
        if(alarm === reminder){
          var date = (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear();  
          var timeTrigger = new Date ( date + ' ' + reminder); 
          this.registerNotification(timeTrigger, this.items[counter].text, formatDate, remindAt); 
        } 
      }  
    }, 1000); 
 

    
  }
 
  ngOnInit() {
    this.afAuth.authState.subscribe(user=>{
      if(!user)
        return;
      this.db.collection('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name, ref =>{
        return ref.orderBy('pos','desc');
      }).snapshotChanges().subscribe(colSnap => {
        this.items = [];
        colSnap.forEach( a => {
          let  item = a.payload.doc.data();
          item['id'] = a.payload.doc.id;
          this.items.push(item);
        });
        this.loading = false;
      });
    });
  }

  registerNotification(timeTrigger, task, dueOn, remindAt){ 
    this.localNotification.schedule({
      title:'Reminder',
      text: 'You have an upcoming task ' + task + '  that is due on ' + dueOn + ' & ' + remindAt,
      trigger: {at: timeTrigger },
      led: { color: '#FF00FF', on: 500, off: 500 },
      sound: null,
      icon: 'https://img.icons8.com/dusk/64/000000/alarm-clock.png',
      foreground: true,
      vibrate: true,
    }); 
  }

  // pressing
  onPress($event) {  
    this.startInterval();
  }
  // release
  onPressUp(item) {  
    this.stopInterval(); 
    this.presentActionSheet(item);
    this.progress = 0; 
  }

  startInterval() {
    const self = this;
    this.interval = setInterval(function () {
        self.progress = self.progress + 1;
    }, 50);
  }

  stopInterval() {
    clearInterval(this.interval);
  }

  
 
  async presentActionSheet(item) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Move to',  
      animated: true,
      cssClass: 'primary',  
      buttons: [
      // Move to Todo
      {
        text: 'Todo', 
        icon: 'list',
        cssClass: 'primary',
        handler: () => {       
          this.todo(item);
        }
      }, 
      // Move to Later
      {
        text: 'Later',
        icon: 'moon',
        cssClass: 'secondary',
        handler: () => {
          this.later(item);
        }
      },
      // Move to Completed
      {
        text: 'Completed',
        icon: 'checkmark-circle',
        handler: () => {
          this.complete(item);
        }
      }, 
      // Delete
      {
        text: 'Delete',
        icon: 'trash',
        role: 'destructive',
        cssClass: 'danger', 
        handler: () => {
          this.delete(item);
        }
      }, 
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => { 
        }
      }]
    });
    await actionSheet.present();
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
  
  async crudMsgs(msg:string) {
    const toast = await this.toastCtrl.create({
      message: msg + ' successfully.',
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'Ok',
    });
    toast.present();
  }


  async add(){
    this.addOrEdit('New Task', val => this.handleAddItem(val.task)) ;
  }

  async edit(item){
    this.addOrEdit('Edit Task', val => this.handleEditItem(val.task, item), item); 
  }

  async showTodoDetails(item){ 
    
    this.router.navigateByUrl('/tabs/'+this.name+'/todo-details/'+item.id+'/'+item.pos);
    
  }


  async addOrEdit(header, handler, item?) {
    const alert = await this.alertCtrl.create({
      header,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { 
          }
        },
        {
          text: 'Ok', 
          handler,
        }
      ],
      inputs:[
        {
          name: 'task',
          type: 'text',
          placeholder: 'My Task',
          value: item ? item.text : '',
        }
      ]
    });
    await alert.present();
    
    alert.getElementsByTagName('input')[0].focus(); // text focus

    alert.addEventListener('keydown', (val=>{
      if(val.keyCode === 13 ){
        handler({task: val.srcElement['value']}); 
        alert.dismiss();
      }
    }));
  }

  handleAddItem(text: string){
    if(!text.trim().length)
      return;

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
    this.db.collection('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name).add({
      text,
      pos:      this.items.length ? this.items[0].pos + 1 : 0,
      created:  nowUtc,
      dueDate:  null,
      remindAt: null,
      note:     null,
      subTasks:  [],
      comments: []
    });
  }

  handleEditItem(text: string, item){
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+item.id).set({
      text,
    },{ merge: true });
  }

  async delete(item){
    let alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete ' + item.text + ' ?', 
      buttons: [
        {
          text: 'Yes', 
          handler: () => {
            this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+item.id).delete();
            this.crudMsgs("Deleted");     
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

  todo(item){
    this.moveItem(item,'todo');
  }

  complete(item){
    this.moveItem(item,'done');
  }

  later(item){
    this.moveItem(item,'later');
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
      this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+list+'/'+id).set(item);
    });

    this.moveToList(list);
    
  }

  moveByOffset(index, offset) {
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items[index].id).set({
      pos: this.items[index+offset].pos
    }, {merge: true});
    this.db.doc('users/'+this.afAuth.auth.currentUser.uid+'/'+this.name+'/'+this.items[index+offset].id).set({
      pos: this.items[index].pos
    }, {merge: true});
  } 

  async alarmMsgs(task, dueOn, remindAt) {
    const alert = await this.alertCtrl.create({
      header: 'Reminder', 
      message: 'You have an upcoming task <strong>' + task + '</strong> that is due on <strong>' + dueOn + ' at ' + remindAt +'</strong>.', 
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {  }
        }, {
          text: 'Okay',
          handler: () => { }
        }
      ]
    });  
    await alert.present();
   
  }

}
