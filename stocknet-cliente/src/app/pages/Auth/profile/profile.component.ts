import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';

import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/Auth/User';
import { MatDividerModule } from '@angular/material/divider';
import { catchError, finalize, of } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatDividerModule
  ]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  isEditing = signal(false);

  defaultPhoto = 'https://i.pravatar.cc/150?img=3';
  profileForm!: FormGroup;

  /**
   *
   */
  constructor() {
    this.loadProfileData();
    
  }

  ngOnInit(): void {
    this.initForm();
    this.loadProfileData();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      nombreCompleto: ['', Validators.required],
      fotoPerfilUrl: [''],
      fechaNacimiento: [''],
      numeroTelefono: ['', [Validators.pattern(/^[0-9]+$/)]]
    });
  }

  loadProfileData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.getProfile().pipe(
  catchError(err => {
    this.error.set(err.message || 'Error al cargar el perfil');
    this.snackBar.open('Error al cargar el perfil', 'Cerrar', {
      duration: 3000,
      panelClass: 'error-snackbar'
    });
    return [];
  }),
  finalize(() => this.isLoading.set(false))
  ).subscribe((response: any) => {
    const profile = response.data;

  this.profileForm.patchValue({
    userName: profile.userName ?? '',
    nombreCompleto: profile.nombreCompleto ?? '',
    email: profile.email ?? '',
    fotoPerfilUrl: profile.fotoPerfilUrl ?? this.defaultPhoto,
    fechaNacimiento: profile.fechaNacimiento ? moment(profile.fechaNacimiento).format('YYYY-MM-DD') : '',
    numeroTelefono: profile.numeroTelefono ?? ''
  });
});
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      this.loadProfileData();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);

    const formValue = this.profileForm.value;

    const updatedUserProfile: User = {
      UserName: formValue.userName ?? '',
      NombreCompleto: formValue.nombreCompleto ?? '',
      Email: formValue.email ?? '',
      FotoPerfilUrl: formValue.fotoPerfilUrl ?? this.defaultPhoto,
      FechaNacimiento: formValue.fechaNacimiento ? new Date(formValue.fechaNacimiento) : new Date(0),
      NumeroTelefono: formValue.numeroTelefono ?? ''
    };

    this.authService.updateProfile(updatedUserProfile).pipe(
      catchError(err => {
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      if (response) {
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
        this.isEditing.set(false);
      }
    });
  }

  handlePhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultPhoto;
  }
}
