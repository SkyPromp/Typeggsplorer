import { Component } from '@angular/core';
import { ExplorerComponent } from '../explorer/explorer.component';

@Component({
  selector: 'app-home',
  imports: [ExplorerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent{
}
