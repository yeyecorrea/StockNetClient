import { Login } from './../interfaces/Auth/Login';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Register } from '../interfaces/Auth/Register';
import { ApiResponse } from '../interfaces/ApiResponse';
import { AuthResponse } from '../interfaces/Auth/AuthResponse';
import { Observable, BehaviorSubject  } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../interfaces/Auth/User';
import {jwtDecode} from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseUrl:string = appsettings.apiUrl;
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.decodeAndSetUserFromToken(); // Solo si estamos en el navegador
    }
  }

  /**
   * Método para registrar un nuevo usuario.
   * @param objeto Objeto que contiene los datos del usuario a registrar.
   * @returns Observable<ApiResponse<AuthResponse>> que contiene la respuesta de la API.
   */
  Register(objeto:Register):Observable<ApiResponse<AuthResponse>>{
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}Auth/register`, objeto);
  }

  /**
   * Método para iniciar sesión con un usuario existente.
   * @param objeto Objeto que contiene las credenciales del usuario.
   * @returns Observable<ApiResponse<AuthResponse>> que contiene la respuesta de la API.
   */
  Login(objeto:Login):Observable<ApiResponse<AuthResponse>>{
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}Auth/login`, objeto);
  }

  /**
   * Método para verificar si el usuario está autenticado.
   * @returns boolean que indica si el usuario está autenticado.
   */
  logout(): void{
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    this.currentUserSubject.next(null); // <--- limpia el observable del usuario
    // Redirigir al usuario a la página de inicio de sesión
     this.router.navigate(['login']);
  }

  /**
   * Método para verificar si el usuario está autenticado.
   * @returns boolean que indica si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    // Verificar si el token existe en el localStorage
    const token = localStorage.getItem('token');
    return !!token; // Devuelve true si el token existe, false en caso contrario
  }

  /**
   * Método para obtener el usuario actual.
   * @returns User | null El usuario actual o null si no hay usuario autenticado.
   */
  getCurrentUser(): User | null{
    if (typeof window === 'undefined') return null; // Asegurarse de que estamos en un entorno del navegador

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodificar el token JWT para obtener los datos del usuario
      const decodec: any = jwtDecode(token);
      const user: User = {
        UserName: decodec.userName || '',
        Email: decodec.email || '',
        NombreCompleto: decodec.nombreCompleto || '',
        FotoPerfilUrl: decodec.fotoUrl || 'https://i.pravatar.cc/150?img=3', // foto aleatoria por defecto
        NumeroTelefono: decodec.telefono || '',
        FechaNacimiento: new Date(decodec.fechaNacimiento) || new Date()
      }

      return user;
    }catch (error) {
      console.error('Error al decodificar el token:', error);
      return null; // Retorna null si hay un error al decodificar el token
    }
  }

  /**
   * Método para decodificar el token JWT y establecer el usuario actual.
   * Este método se llama al iniciar el servicio para establecer el usuario actual desde el token almacenado.
   */
  public decodeAndSetUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUserSubject.next(null);
    return;
    }
    // Decodificar el token JWT para obtener los datos del usuario
    // y actualizar el BehaviorSubject con el usuario actual
    try {
      const decoded: any = jwtDecode(token);
      const user: User = {
        UserName: decoded.userName || '',
        Email: decoded.email || '',
        NombreCompleto: decoded.nombreCompleto || '',
        FotoPerfilUrl: decoded.fotoUrl || 'https://i.pravatar.cc/150?img=3', // foto aleatoria por defecto
        NumeroTelefono: decoded.telefono || '',
        FechaNacimiento: new Date(decoded.fechaNacimiento) || new Date()
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.currentUserSubject.next(null);
    }
  }

  /**
   * 
   * @returns Observable<User> que contiene los datos del perfil del usuario autenticado.
   * Este método realiza una solicitud GET a la API para obtener los datos del perfil del usuario
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}Auth/profile`);
  }

  /**
   * Método para actualizar el perfil del usuario.
   * @param user Objeto que contiene los datos actualizados del usuario.
   * @returns Observable<ApiResponse<User>> que contiene la respuesta de la API.
   */
  updateProfile(user: User): Observable<ApiResponse<User>> {
    this.currentUserSubject.next(user);
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}Auth/updateProfile`, user);
  }

  validateToken(token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}Auth/validateToken?token=${token}`);
  }
}
