import { Component, OnInit,  Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ToastController, ModalController, NavController } from '@ionic/angular';

import { Router } from '@angular/router';


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

  constructor(
    private afAuth:  AngularFireAuth,
    private db: AngularFirestore,
    private alertCtrl : AlertController, 
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,  
    private router: Router, 
    public navCtrl: NavController,
  ) { }

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

}
