import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Login } from '../../../interfaces/Auth/Login';

// material 
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormField } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatCardModule, MatGridListModule, MatInputModule, MatFormField, ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authServices = inject(AuthService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);

  errorMessage: string = '';

  public formLogin = this.formBuild.group({
    email: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.minLength(6)]]
  })


  login(){
    this.errorMessage = '';

    // Validar si el formulario es válido
    if(this.formLogin.valid){
      // Crear un objeto de tipo Login con los valores del formulario
    const objecto:Login = {
      email: this.formLogin.value.email ?? '',
      passWord: this.formLogin.value.passWord ?? ''
    }

    // Llamar al servicio de autenticación para iniciar sesión
    this.authServices.Login(objecto).subscribe({
      next: (response) => {
        if(response.success && response.data){
          // Guardar el token en el localStorage
          localStorage.setItem('token', response.data?.token ?? '');
          this.authServices.decodeAndSetUserFromToken();
          // Redirigir al usuario a la página principal
          this.router.navigate(['/']);
        }else{
          // Mostrar mensaje de error
          this.errorMessage = response.message || 'Ocurrió un error inesperado.';
        }
      },
      error: (error) => {
        // Capturamos los errores Http
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error de conexión con el servidor.';
        }
      }
    })
    };
  }

  register(){
    // Redirigir al usuario a la página de registro
    this.router.navigate(['register']);
  }
  

}
