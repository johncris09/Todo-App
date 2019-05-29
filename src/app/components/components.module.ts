import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { TodoDetailsComponent } from './todo-details/todo-details.component';
import { IonicModule } from '@ionic/angular';  

@NgModule({
  declarations: [
    ListComponent,
    TodoDetailsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,  
  ],
  exports: [
    ListComponent,
    TodoDetailsComponent
  ],
})

export class ComponentsModule { }