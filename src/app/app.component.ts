import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [ButtonModule, RouterModule],
  selector: 'app-root',
  template: ` <router-outlet /> `,
})
export class AppComponent {}
