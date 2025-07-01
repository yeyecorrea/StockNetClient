import { Register } from './../../../interfaces/Auth/Register';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// material 
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormField } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [MatButtonModule, MatCardModule, MatGridListModule, MatInputModule, MatFormField, ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  // Inyectar los servicios necesarios
  private authServices = inject(AuthService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);
  public errorMessage: string = '';

  public formRegister = this.formBuild.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    passWord: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassWord: ['', [Validators.required, Validators.minLength(6)]]
  })

  Register() {
    this.errorMessage = '';

    if (this.formRegister.valid){
      const objeto:Register = {
      userName: this.formRegister.value.userName ?? '',
      email: this.formRegister.value.email ?? '',
      passWord: this.formRegister.value.passWord ?? '',
      confirmPassword: this.formRegister.value.confirmPassWord ?? ''
    }

    this.authServices.Register(objeto).subscribe({ 
      next: (response) => {
        if (response.success) {
          // Guardar el token en el localStorage
          localStorage.setItem('token', response.data?.token ?? '');
          // Redirigir al usuario a la página principal
          this.router.navigate(['login']);
        } else {
          // Mostrar mensaje de error
          this.errorMessage = response.message || 'Error desconocido al iniciar sesión.';
        }
      },
      error: (error) => {
        // Manejar el error de la solicitud
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error del servidor o red.';
        }
      }
    })
    };
  }

  login() {
    this.router.navigate(['login']);
  }

}
