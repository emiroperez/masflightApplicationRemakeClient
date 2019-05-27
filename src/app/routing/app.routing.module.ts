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
import { AuthGuard } from '../guards/auth.guard';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';

export const routes: Routes = [
  { path: '', component: LoginScreenComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'application', component: ApplicationComponent, canActivate: [AuthGuard] },
  { path: 'admin-menu', component: AdminMenuComponent, canActivate: [AuthGuard] },
  { path: 'create-membership', component: CreateMempershipsComponent, canActivate: [AuthGuard] },
  { path: 'category-arguments', component: CategoryArgumentsComponent, canActivate: [AuthGuard] },
  { path: 'app-msf-test', component: MsfTestComponent, canActivate: [AuthGuard] },
  { path: 'user-activation', component: UserActivationComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'arguments-category', component: AdminArgumentsCategoryComponent, canActivate: [AuthGuard] },
  { path: 'create-customer', component: CreateCustomerComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
