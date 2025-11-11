import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  withEntities,
  setEntities,
  updateEntity,
} from '@ngrx/signals/entities';
import { Store } from '@ngrx/store';
import type { Pokemon } from '../../../shared/data-access';
import {
  selectAllPokemons,
  selectFavoriteIds,
  PokemonActions,
} from '../../data-access';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

interface PokemonListAdditionalState {
  searchTerm: string;
  viewMode: 'all' | 'favorites';
  isLoading: boolean;
}

export const PokemonListLocalStore = signalStore(
  // Entity management for local pokemon list
  withEntities<Pokemon>(),

  // Additional local state
  withState<PokemonListAdditionalState>({
    searchTerm: '',
    viewMode: 'all',
    isLoading: false,
  }),

  // Computed values
  withComputed((store) => {
    const globalStore = inject(Store);
    const allPokemons = globalStore.selectSignal(selectAllPokemons);
    const favoriteIds = globalStore.selectSignal(selectFavoriteIds);

    return {
      // Read from Global Store (source of truth)
      allPokemons,
      favoriteIds,

      // Derived state
      isShowingFavorites: computed(() => store.viewMode() === 'favorites'),
      hasSearchTerm: computed(() => store.searchTerm().length > 0),

      // Filtered and sorted pokemons based on local state
      filteredPokemons: computed(() => {
        const pokemons = allPokemons();
        const favorites = favoriteIds();
        const searchTerm = store.searchTerm().toLowerCase();
        const viewMode = store.viewMode();

        let filtered = pokemons;

        // Filter by favorites
        if (viewMode === 'favorites') {
          filtered = filtered.filter((p) => favorites.includes(p.id));
        }

        // Filter by search term
        if (searchTerm) {
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchTerm),
          );
        }

        // Sort by ID
        return [...filtered].sort((a, b) => a.id - b.id);
      }),

      // Check if a pokemon is favorite
      isPokemonFavorite: computed(() => {
        const favorites = favoriteIds();
        return (id: number) => favorites.includes(id);
      }),
    };
  }),

  // Methods
  withMethods((store, globalStore = inject(Store)) => ({
    // Load pokemons from global store into local entities
    syncWithGlobalStore: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        tap(() => {
          const pokemons = store.allPokemons();
          patchState(store, setEntities(pokemons), { isLoading: false });
        }),
      ),
    ),

    // Update view mode
    setViewMode(mode: 'all' | 'favorites'): void {
      patchState(store, { viewMode: mode });
    },

    // Update search term
    setSearchTerm(term: string): void {
      patchState(store, { searchTerm: term });
    },

    // Clear search
    clearSearch(): void {
      patchState(store, { searchTerm: '' });
    },

    // Dispatch action to global store to load pokemons
    loadPokemons(): void {
      globalStore.dispatch(PokemonActions.loadPokemons());
    },

    // Dispatch action to global store to toggle favorite
    toggleFavorite(id: number): void {
      globalStore.dispatch(PokemonActions.toggleFavorite({ id }));
    },

    // Optimistically update local entity (if needed for UI responsiveness)
    optimisticallyUpdatePokemon(id: number, changes: Partial<Pokemon>): void {
      patchState(store, updateEntity({ id, changes }));
    },
  })),

  // Lifecycle hooks
  withHooks({
    onInit(store) {
      // Load pokemons when store initializes
      store.loadPokemons();
      // Sync with global store
      store.syncWithGlobalStore();
    },
  }),
);
