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
  selector: 'app-pokemon-info',
  imports: [ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pokemon()) {
      <p-card>
        <div class="space-y-4">
          <h2 class="text-3xl font-bold capitalize">
            {{ pokemon()!.name }}
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-600">ID:</strong>
              <p class="text-lg">{{ pokemon()!.id }}</p>
            </div>
            <div>
              <strong class="text-gray-600">Height:</strong>
              <p class="text-lg">{{ pokemon()!.height }} dm</p>
            </div>
            <div>
              <strong class="text-gray-600">Weight:</strong>
              <p class="text-lg">{{ pokemon()!.weight }} hg</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <p-button
              [icon]="isFavorite() ? 'pi pi-star-fill' : 'pi pi-star'"
              [label]="
                isFavorite() ? 'Remove from Favorites' : 'Add to Favorites'
              "
              [severity]="isFavorite() ? 'contrast' : 'secondary'"
              (onClick)="favoriteToggle.emit()"
            />
          </div>
        </div>
      </p-card>
    }
  `,
})
export class PokemonInfoComponent {
  pokemon = input<Pokemon | null>(null);
  isFavorite = input<boolean>(false);
  favoriteToggle = output<void>();
}
