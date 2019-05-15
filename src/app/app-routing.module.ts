import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'todo', pathMatch: 'full' },
  { path: 'todo', loadChildren: './todo/todo.module#TodoPageModule' },
  { path: 'later', loadChildren: './later/later.module#LaterPageModule' },
  { path: 'done', loadChildren: './done/done.module#DonePageModule' },
  { path: 'account', loadChildren: './account/account.module#AccountPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
