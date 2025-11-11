import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Pokemon } from '../../../shared/data-access/models/pokemon.model';

export const PokemonActions = createActionGroup({
  source: 'Pokemon',
  events: {
    'Load Pokemons': emptyProps(),
    'Load Pokemons Success': props<{ pokemons: Pokemon[] }>(),
    'Load Pokemons Failure': props<{ error: string }>(),

    'Load Pokemon By Id': props<{ id: number }>(),
    'Load Pokemon By Id Success': props<{ pokemon: Pokemon }>(),
    'Load Pokemon By Id Failure': props<{ error: string }>(),

    'Toggle Favorite': props<{ id: number }>(),
    'Clear Error': emptyProps(),
  },
});
