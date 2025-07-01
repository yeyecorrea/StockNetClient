import { Routes } from '@angular/router';
import { LoginComponent } from './pages/Auth/login/login.component';
import { RegisterComponent } from './pages/Auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/Auth/profile/profile.component';
import { authGuard } from './custom/auth.guard';

export const routes: Routes = [
    {path: 'login', component:LoginComponent},
    {path: 'register', component:RegisterComponent},
    {path: '', component:HomeComponent},
    {path: 'profile', component:ProfileComponent, canActivate: [authGuard]}
];
