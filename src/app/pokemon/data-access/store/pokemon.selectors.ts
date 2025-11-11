import { createFeatureSelector, createSelector } from '@ngrx/store';
import { pokemonAdapter, type PokemonState } from './pokemon.state';

export const selectPokemonState =
  createFeatureSelector<PokemonState>('pokemon');

const { selectAll, selectEntities, selectIds, selectTotal } =
  pokemonAdapter.getSelectors();

// Entity selectors
export const selectAllPokemons = createSelector(selectPokemonState, selectAll);

export const selectPokemonEntities = createSelector(
  selectPokemonState,
  selectEntities,
);

export const selectPokemonIds = createSelector(selectPokemonState, selectIds);

export const selectPokemonTotal = createSelector(
  selectPokemonState,
  selectTotal,
);

// Custom selectors
export const selectPokemonLoading = createSelector(
  selectPokemonState,
  (state) => state.loading,
);

export const selectPokemonError = createSelector(
  selectPokemonState,
  (state) => state.error,
);

export const selectFavoriteIds = createSelector(
  selectPokemonState,
  (state) => state.favoriteIds,
);

export const selectSelectedPokemonId = createSelector(
  selectPokemonState,
  (state) => state.selectedPokemonId,
);

export const selectSelectedPokemon = createSelector(
  selectPokemonEntities,
  selectSelectedPokemonId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : null),
);

export const selectFavoritePokemons = createSelector(
  selectAllPokemons,
  selectFavoriteIds,
  (pokemons, favoriteIds) =>
    pokemons.filter((pokemon) => favoriteIds.includes(pokemon.id)),
);

export const selectIsPokemonFavorite = (id: number) =>
  createSelector(selectFavoriteIds, (favoriteIds) => favoriteIds.includes(id));
