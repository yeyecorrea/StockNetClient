import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Component } from '@angular/core';
import {NavbarComponent} from './pages/Shared/navbar/navbar.component';
import { FooterComponent } from "./pages/Shared/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, MatCardModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'stocknet-cliente';
}
