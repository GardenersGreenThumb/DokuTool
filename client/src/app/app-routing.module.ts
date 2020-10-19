import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './app.authguard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tool/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'tool/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['basic'] }
  },
  {
    path: '**',
    redirectTo: '/tool/dashboard',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
