import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Pokemon } from '../../../shared/data-access';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-pokemon-grid',
  imports: [PokemonCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      @for (pokemon of pokemons(); track pokemon.id) {
        <app-pokemon-card
          [pokemon]="pokemon"
          [isFavorite]="favoriteIds().includes(pokemon.id)"
          (detailsClick)="detailsClick.emit($event)"
          (favoriteToggle)="favoriteToggle.emit($event)"
        />
      }
    </div>
  `,
})
export class PokemonGridComponent {
  pokemons = input.required<Pokemon[]>();
  favoriteIds = input<number[]>([]);

  detailsClick = output<number>();
  favoriteToggle = output<number>();
}
