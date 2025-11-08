import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [ButtonModule, RouterModule],
  selector: 'app-root',
  template: `
    <div class="flex flex-col items-center justify-center h-screen">
      <p-button label="Check" severity="primary" />
    </div>
  `,
})
export class AppComponent {}
