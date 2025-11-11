# NgRx Store Usage Examples 🎯

## Quick Start

### 1. Using the Store in a Component

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  PokemonActions,
  selectAllPokemons,
  selectPokemonLoading,
} from '../store/pokemon';

@Component({
  selector: 'app-my-component',
  template: `
    @if (loading()) {
      <p>Loading...</p>
    }
    @for (pokemon of pokemons(); track pokemon.id) {
      <div>{{ pokemon.name }}</div>
    }
  `,
})
export class MyComponent implements OnInit {
  private store = inject(Store);

  // Convert store selectors to signals
  pokemons = this.store.selectSignal(selectAllPokemons);
  loading = this.store.selectSignal(selectPokemonLoading);

  ngOnInit(): void {
    // Dispatch action to load data
    this.store.dispatch(PokemonActions.loadPokemons());
  }
}
```

### 2. Load a Specific Pokemon

```typescript
loadPokemon(id: number): void {
  this.store.dispatch(PokemonActions.loadPokemonById({ id }));
}

// Access selected pokemon
selectedPokemon = this.store.selectSignal(selectSelectedPokemon);
```

### 3. Favorite Management

```typescript
toggleFavorite(id: number): void {
  this.store.dispatch(PokemonActions.toggleFavorite({ id }));
}

// Get all favorites
favoritePokemons = this.store.selectSignal(selectFavoritePokemons);

// Check if specific pokemon is favorite
isFavorite = this.store.selectSignal(selectIsPokemonFavorite(25));
```

### 4. Error Handling

```typescript
error = this.store.selectSignal(selectPokemonError);

clearError(): void {
  this.store.dispatch(PokemonActions.clearError());
}
```

## NgRx Signals for Local State

### Creating a Local Store

```typescript
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed } from '@angular/core';

interface LocalState {
  filter: string;
  sortBy: 'name' | 'id';
}

const MyLocalStore = signalStore(
  withState<LocalState>({
    filter: '',
    sortBy: 'name',
  }),
  withComputed(({ filter, sortBy }) => ({
    hasFilter: computed(() => filter().length > 0),
    sortLabel: computed(() => (sortBy() === 'name' ? 'By Name' : 'By ID')),
  })),
  withMethods((store) => ({
    setFilter(value: string): void {
      patchState(store, { filter: value });
    },
    setSortBy(value: 'name' | 'id'): void {
      patchState(store, { sortBy: value });
    },
    reset(): void {
      patchState(store, { filter: '', sortBy: 'name' });
    },
  })),
);

// Use in component
@Component({
  providers: [MyLocalStore],
})
export class MyComponent {
  localStore = inject(MyLocalStore);

  // Access state
  currentFilter = this.localStore.filter();

  // Update state
  updateFilter(value: string): void {
    this.localStore.setFilter(value);
  }
}
```

## Combining Global + Local State

```typescript
@Component({
  selector: 'app-pokemon-list',
  providers: [FilterStore],
  template: `
    <!-- Filter controls (local state) -->
    <input
      [value]="localStore.filter()"
      (input)="localStore.setFilter($event.target.value)"
    />

    <!-- Pokemon list (global state + local filtering) -->
    @for (pokemon of filteredPokemons(); track pokemon.id) {
      <div>{{ pokemon.name }}</div>
    }
  `,
})
export class PokemonListComponent implements OnInit {
  private store = inject(Store);
  localStore = inject(FilterStore);

  // Global state
  allPokemons = this.store.selectSignal(selectAllPokemons);

  // Derived state combining global + local
  filteredPokemons = computed(() => {
    const filter = this.localStore.filter().toLowerCase();
    return this.allPokemons().filter((p) =>
      p.name.toLowerCase().includes(filter),
    );
  });

  ngOnInit(): void {
    this.store.dispatch(PokemonActions.loadPokemons());
  }
}
```

## Effects Usage

Effects automatically handle side effects. You don't call them directly:

```typescript
// ✅ Correct: Dispatch action
this.store.dispatch(PokemonActions.loadPokemons());
// Effect listens for this action and makes HTTP call

// ❌ Wrong: Don't call effects directly
// this.pokemonEffects.loadPokemons$();
```

## Testing

### Testing Actions

```typescript
it('should create loadPokemons action', () => {
  const action = PokemonActions.loadPokemons();
  expect(action.type).toBe('[Pokemon] Load Pokemons');
});
```

### Testing Reducers

```typescript
it('should set loading to true on loadPokemons', () => {
  const state = pokemonReducer(initialState, PokemonActions.loadPokemons());
  expect(state.loading).toBe(true);
  expect(state.error).toBeNull();
});
```

### Testing Selectors

```typescript
it('should select all pokemons', () => {
  const pokemons = [{ id: 1, name: 'bulbasaur' }];
  const state = {
    pokemon: { ...initialState, entities: { 1: pokemons[0] }, ids: [1] },
  };
  const result = selectAllPokemons(state);
  expect(result).toEqual(pokemons);
});
```

### Testing Effects

```typescript
it('should load pokemons successfully', (done) => {
  const pokemons = [{ id: 1, name: 'bulbasaur' }];
  pokemonService.getAllPokemons = jest.fn(() => of(pokemons));

  actions$ = of(PokemonActions.loadPokemons());
  effects.loadPokemons$.subscribe((action) => {
    expect(action).toEqual(PokemonActions.loadPokemonsSuccess({ pokemons }));
    done();
  });
});
```

## Advanced Patterns

### Optimistic Updates

```typescript
// Immediately update UI, revert on error
toggleFavorite(id: number): void {
  this.store.dispatch(PokemonActions.toggleFavorite({ id }));
  // No need to wait for server response
}
```

### Derived Selectors

```typescript
export const selectPokemonsByType = (type: string) =>
  createSelector(selectAllPokemons, (pokemons) =>
    pokemons.filter((p) => p.types?.includes(type)),
  );
```

### Router Integration

```typescript
// Already configured with provideRouterStore()
import { getRouterSelectors } from '@ngrx/router-store';

const { selectRouteParams } = getRouterSelectors();

// Use in component to react to route changes
routeParams = this.store.selectSignal(selectRouteParams);
```

## Performance Tips

1. **Use selectSignal**: Converts observables to signals for better performance
2. **OnPush Strategy**: Always use `ChangeDetectionStrategy.OnPush`
3. **Entity Adapter**: Automatically optimizes normalized data access
4. **Memoized Selectors**: Selectors are automatically memoized
5. **Local Store**: Keep UI-only state local to avoid global state bloat

## Common Pitfalls

❌ **Don't modify state directly**

```typescript
// Wrong
state.favoriteIds.push(id);

// Correct
return { ...state, favoriteIds: [...state.favoriteIds, id] };
```

❌ **Don't subscribe in components (with signals)**

```typescript
// Old way (unnecessary with signals)
this.store.select(selectAllPokemons).subscribe((pokemons) => {
  this.pokemons = pokemons;
});

// New way (with signals)
pokemons = this.store.selectSignal(selectAllPokemons);
```

❌ **Don't put derived state in store**

```typescript
// Wrong: Store both raw data and derived
interface State {
  pokemons: Pokemon[];
  filteredPokemons: Pokemon[]; // ❌ Redundant
}

// Correct: Store raw data, derive in selectors
interface State {
  pokemons: Pokemon[];
}
// Use computed() or selector to derive filtered list
```

## Resources

- [NgRx Docs](https://ngrx.io/)
- [NgRx Signals](https://ngrx.io/guide/signals)
- [Entity Adapter](https://ngrx.io/guide/entity)
- [Effects](https://ngrx.io/guide/effects)
