import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Pokemon } from '../../../shared/data-access';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-pokemon-card',
  imports: [ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card>
      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-semibold capitalize">
          {{ pokemon().name }}
        </h3>
        <p class="text-sm text-gray-600">ID: {{ pokemon().id }}</p>
        <div class="flex gap-2 mt-2">
          <p-button
            icon="pi pi-info-circle"
            [label]="'Details'"
            size="small"
            (onClick)="detailsClick.emit(pokemon().id)"
          />
          <p-button
            [icon]="isFavorite() ? 'pi pi-star-fill' : 'pi pi-star'"
            [severity]="isFavorite() ? 'contrast' : 'secondary'"
            size="small"
            (onClick)="favoriteToggle.emit(pokemon().id)"
          />
        </div>
      </div>
    </p-card>
  `,
})
export class PokemonCardComponent {
  pokemon = input.required<Pokemon>();
  isFavorite = input<boolean>(false);

  detailsClick = output<number>();
  favoriteToggle = output<number>();
}
