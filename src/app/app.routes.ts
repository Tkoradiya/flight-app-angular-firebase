import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { FlightForm } from './pages/flight-form/flight-form';
import { authGuard, loginGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'flight-form', component: FlightForm, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
