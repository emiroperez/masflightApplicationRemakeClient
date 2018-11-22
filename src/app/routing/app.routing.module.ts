import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { RegisterComponent } from '../register/register.component';
import { ApplicationComponent } from '../application/application.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';

export const routes: Routes = [
  { path: '', component: LoginScreenComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'application', component: ApplicationComponent },
  { path: 'admin-menu', component: AdminMenuComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}