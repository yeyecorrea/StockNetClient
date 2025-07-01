import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

//material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../interfaces/Auth/User';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-navbar',
  imports: [
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
    RouterModule,
    CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  private authServices = inject(AuthService);
  usuario: User | null = null;

  constructor(private authService:AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  editarPerfil() {
    // Redirige o abre un modal
    console.log('Editar perfil');
  }

  cerrarSesion() {
    this.authServices.logout();
  }
}
