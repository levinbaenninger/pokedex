import { createEntityAdapter, type EntityState } from '@ngrx/entity';
import type { Pokemon } from '../../../shared/data-access/models/pokemon.model';

export interface PokemonState extends EntityState<Pokemon> {
  selectedPokemonId: number | null;
  favoriteIds: number[];
  loading: boolean;
  error: string | null;
}

export const pokemonAdapter = createEntityAdapter<Pokemon>({
  selectId: (pokemon) => pokemon.id,
  sortComparer: (a, b) => a.id - b.id,
});

export const initialPokemonState: PokemonState = pokemonAdapter.getInitialState(
  {
    selectedPokemonId: null,
    favoriteIds: [],
    loading: false,
    error: null,
  },
);
