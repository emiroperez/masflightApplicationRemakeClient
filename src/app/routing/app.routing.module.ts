import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { RegisterComponent } from '../register/register.component';
import { ApplicationComponent } from '../application/application.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { CreateMempershipsComponent } from '../create-memperships/create-memperships.component';
import { CategoryArgumentsComponent } from '../category-arguments/category-arguments.component';
import { MsfTestComponent } from '../msf-test/msf-test.component';
import { UserActivationComponent } from '../user-activation/user-activation.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { AdminArgumentsCategoryComponent } from '../admin-arguments-category/admin-arguments-category.component'

export const routes: Routes = [
  { path: '', component: LoginScreenComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'application', component: ApplicationComponent },
  { path: 'admin-menu', component: AdminMenuComponent },
  { path: 'create-membership', component: CreateMempershipsComponent },
  { path: 'category-arguments', component: CategoryArgumentsComponent },
  { path: 'app-msf-test', component: MsfTestComponent},
  { path: 'user-activation', component: UserActivationComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'arguments-category', component: AdminArgumentsCategoryComponent}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
