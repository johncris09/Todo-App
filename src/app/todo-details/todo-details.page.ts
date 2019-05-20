import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
})
export class TodoDetailsPage implements OnInit {

  constructor( 
    public activeRoute: ActivatedRoute,
  ){
    
  }

  ngOnInit() {
    let dataRecv = this.activeRoute.snapshot.paramMap.get('id');
    console.info(dataRecv);

  }
 

}
