import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { RegisterComponent } from '../register/register.component';
import { ApplicationComponent } from '../application/application.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { CreateMembershipsComponent } from '../create-memberships/create-memberships.component';
import { UserActivationComponent } from '../user-activation/user-activation.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { AdminArgumentsCategoryComponent } from '../admin-arguments-category/admin-arguments-category.component'
import { AuthGuard } from '../guards/auth.guard';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';
import { AdminArgumentsGroupComponent } from '../admin-arguments-group/admin-arguments-group.component';

export const routes: Routes = [
  { path: '', component: LoginScreenComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'application', component: ApplicationComponent, canActivate: [AuthGuard] },
  { path: 'admin-menu', component: AdminMenuComponent, canActivate: [AuthGuard] },
  { path: 'create-membership', component: CreateMembershipsComponent, canActivate: [AuthGuard] },
  { path: 'user-activation', component: UserActivationComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'arguments-category', component: AdminArgumentsCategoryComponent, canActivate: [AuthGuard] },
  { path: 'arguments-groups', component: AdminArgumentsGroupComponent, canActivate: [AuthGuard] },
  { path: 'create-customer', component: CreateCustomerComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
