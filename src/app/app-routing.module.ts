import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  // { path: 'todo', loadChildren: './todo/todo.module#TodoPageModule' },
  // { path: 'later', loadChildren: './later/later.module#LaterPageModule' },
  // { path: 'done', loadChildren: './done/done.module#DonePageModule' },
  // { path: 'account', loadChildren: './account/account.module#AccountPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  // { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'tos', loadChildren: './tos/tos.module#TosPageModule' },
  { path: 'privacy', loadChildren: './privacy/privacy.module#PrivacyPageModule' },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'todo',
        children: [
          {
            path: '',
            loadChildren:  './todo/todo.module#TodoPageModule'    
          }
        ]
      },
      {
        path: 'later',
        children: [
          {
            path: '',
            loadChildren: './later/later.module#LaterPageModule'
          }
        ]
      },
      {
        path: 'done',
        children: [
          {
            path: '',
            loadChildren: './done/done.module#DonePageModule'
          }
        ]
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadChildren: './account/account.module#AccountPageModule'
          }
        ]
      },
      {
        path: ':path/todo-details/:id/:pos',
        children: [
          {
            path: '',
            loadChildren: './todo-details/todo-details.module#TodoDetailsPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/todo',
        pathMatch : 'full'
      }
    ]
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
