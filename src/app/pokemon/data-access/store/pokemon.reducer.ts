import { createReducer, on } from '@ngrx/store';
import { PokemonActions } from './pokemon.actions';
import {
  initialPokemonState,
  pokemonAdapter,
  type PokemonState,
} from './pokemon.state';

export const pokemonReducer = createReducer(
  initialPokemonState,

  // Load Pokemons
  on(
    PokemonActions.loadPokemons,
    (state): PokemonState => ({
      ...state,
      loading: true,
      error: null,
    }),
  ),

  on(
    PokemonActions.loadPokemonsSuccess,
    (state, { pokemons }): PokemonState =>
      pokemonAdapter.setAll(pokemons, {
        ...state,
        loading: false,
        error: null,
      }),
  ),

  on(
    PokemonActions.loadPokemonsFailure,
    (state, { error }): PokemonState => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  // Load Pokemon By Id
  on(
    PokemonActions.loadPokemonById,
    (state): PokemonState => ({
      ...state,
      loading: true,
      error: null,
    }),
  ),

  on(
    PokemonActions.loadPokemonByIdSuccess,
    (state, { pokemon }): PokemonState =>
      pokemonAdapter.upsertOne(pokemon, {
        ...state,
        selectedPokemonId: pokemon.id,
        loading: false,
        error: null,
      }),
  ),

  on(
    PokemonActions.loadPokemonByIdFailure,
    (state, { error }): PokemonState => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  // Toggle Favorite
  on(PokemonActions.toggleFavorite, (state, { id }): PokemonState => {
    const isFavorite = state.favoriteIds.includes(id);
    return {
      ...state,
      favoriteIds: isFavorite
        ? state.favoriteIds.filter((favId) => favId !== id)
        : [...state.favoriteIds, id],
    };
  }),

  // Clear Error
  on(
    PokemonActions.clearError,
    (state): PokemonState => ({
      ...state,
      error: null,
    }),
  ),
);
