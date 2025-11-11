# Entity-Based Local Store Pattern 🎯

## Overview

The pokemon-list feature now uses **NgRx Signal Store with entities** for local state management, following the same pattern as your review store example.

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  GLOBAL STORE (NgRx Store)                                  │
│  - Source of truth for pokemon data                         │
│  - Manages: all pokemons, favorites, loading, errors        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Read via selectSignal()
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  LOCAL STORE (NgRx Signal Store with Entities)              │
│  - Feature-specific state management                        │
│  - Manages: UI state, filters, search, computed views       │
│  - Uses: withEntities<Pokemon>()                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Pass filtered data
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  COMPONENT                                                   │
│  - Renders UI                                                │
│  - Delegates to local store                                 │
└─────────────────────────────────────────────────────────────┘
```

## Local Store Structure

### File: `pokemon-list.store.ts`

```typescript
export const PokemonListLocalStore = signalStore(
  // 1. Entity management
  withEntities<Pokemon>(),

  // 2. Additional state
  withState<PokemonListAdditionalState>({
    searchTerm: '',
    viewMode: 'all' | 'favorites',
    isLoading: false,
  }),

  // 3. Computed properties
  withComputed((store) => {
    const globalStore = inject(Store);
    const allPokemons = globalStore.selectSignal(selectAllPokemons);
    const favoriteIds = globalStore.selectSignal(selectFavoriteIds);

    return {
      // Read from global store
      allPokemons,
      favoriteIds,

      // Derived state
      isShowingFavorites: computed(() => ...),
      hasSearchTerm: computed(() => ...),

      // Filtered and sorted
      filteredPokemons: computed(() => {
        // Complex filtering logic here
      }),
    };
  }),

  // 4. Methods
  withMethods((store, globalStore = inject(Store)) => ({
    // Sync with global store
    syncWithGlobalStore: rxMethod<void>(...),

    // Update local state
    setViewMode(mode): void { ... },
    setSearchTerm(term): void { ... },

    // Dispatch to global store
    loadPokemons(): void {
      globalStore.dispatch(PokemonActions.loadPokemons());
    },
    toggleFavorite(id): void {
      globalStore.dispatch(PokemonActions.toggleFavorite({ id }));
    },

    // Optimistic updates (optional)
    optimisticallyUpdatePokemon(id, changes): void {
      patchState(store, updateEntity({ id, changes }));
    },
  })),

  // 5. Lifecycle hooks
  withHooks({
    onInit(store) {
      store.loadPokemons();
      store.syncWithGlobalStore();
    },
  }),
);
```

## Key Features

### 1. **Entity Management** 🗂️

Uses `withEntities<Pokemon>()` to manage a local collection:

```typescript
withEntities<Pokemon>();
```

Provides:

- `entities()` - Array of all entities
- `entityMap()` - Dictionary for O(1) lookups
- `ids()` - Array of entity IDs

Entity operations:

- `setEntities(pokemons)` - Set all entities
- `addEntity(pokemon)` - Add one entity
- `updateEntity({ id, changes })` - Update entity
- `removeEntity(id)` - Remove entity

### 2. **Read from Global Store** 📖

Local store reads from global store as **source of truth**:

```typescript
withComputed((store) => {
  const globalStore = inject(Store);
  const allPokemons = globalStore.selectSignal(selectAllPokemons);
  const favoriteIds = globalStore.selectSignal(selectFavoriteIds);

  return {
    allPokemons, // ← Global store data
    favoriteIds, // ← Global store data
    // ... computed values based on global + local state
  };
});
```

### 3. **Complex Filtering** 🔍

Local store handles **UI-specific logic**:

```typescript
filteredPokemons: computed(() => {
  const pokemons = allPokemons(); // From global
  const favorites = favoriteIds(); // From global
  const searchTerm = store.searchTerm(); // From local
  const viewMode = store.viewMode(); // From local

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
});
```

### 4. **rxMethod for Async Operations** ⚡

Uses `rxMethod` from `@ngrx/signals/rxjs-interop`:

```typescript
syncWithGlobalStore: rxMethod<void>(
  pipe(
    tap(() => patchState(store, { isLoading: true })),
    tap(() => {
      const pokemons = store.allPokemons();
      patchState(store, setEntities(pokemons), { isLoading: false });
    }),
  ),
);
```

### 5. **Dispatch to Global Store** 🔄

Local store can dispatch actions to global store:

```typescript
toggleFavorite(id: number): void {
  globalStore.dispatch(PokemonActions.toggleFavorite({ id }));
}
```

### 6. **Optimistic Updates** ⚡

Can optimistically update local entities:

```typescript
optimisticallyUpdatePokemon(id: number, changes: Partial<Pokemon>): void {
  patchState(store, updateEntity({ id, changes }));
}
```

Then revert on error using global store actions.

### 7. **Lifecycle Hooks** 🪝

Initialize on component mount:

```typescript
withHooks({
  onInit(store) {
    store.loadPokemons(); // Load data from API
    store.syncWithGlobalStore(); // Sync with global store
  },
});
```

## Component Integration

### Simplified Component

Component becomes **very thin** - just delegates to local store:

```typescript
@Component({
  selector: 'app-pokemon-list',
  providers: [PokemonListLocalStore], // ← Provide local store
  template: `
    <input
      [value]="localStore.searchTerm()"
      (input)="localStore.setSearchTerm($event.target.value)"
    />

    <app-pokemon-grid
      [pokemons]="localStore.filteredPokemons()"
      [favoriteIds]="localStore.favoriteIds()"
      (detailsClick)="navigateToDetail($event)"
      (favoriteToggle)="localStore.toggleFavorite($event)"
    />
  `,
})
export class PokemonListComponent {
  private router = inject(Router);
  localStore = inject(PokemonListLocalStore); // ← Inject local store

  navigateToDetail(id: number): void {
    this.router.navigate(['/pokemon', id]);
  }
}
```

**Before (without entity store):** 110 lines
**After (with entity store):** 109 lines (+ separate store file)

## Benefits

### 🎯 **Separation of Concerns**

- **Global Store**: Application-wide data (source of truth)
- **Local Store**: Feature-specific UI state and logic
- **Component**: Just renders and delegates

### ♻️ **Reusability**

- Local store can be reused across similar features
- Entity operations are standardized
- Easy to test in isolation

### 🚀 **Performance**

- Memoized computed values
- Only re-compute when dependencies change
- Efficient entity lookups with `entityMap`

### 🧪 **Testability**

- Local store testable without component
- Can mock global store
- Pure computed functions

### 📈 **Scalability**

- Add new filters/sorts without touching component
- Complex logic stays in store
- Easy to add new features

## Comparison: Review Store Pattern

Your review store example vs Pokemon list store:

| Feature            | Review Store             | Pokemon List Store                                |
| ------------------ | ------------------------ | ------------------------------------------------- |
| **Entity Type**    | `Review`                 | `Pokemon`                                         |
| **Global Store**   | `selectCurrentProductId` | `selectAllPokemons`, `selectFavoriteIds`          |
| **Local State**    | (none extra)             | `searchTerm`, `viewMode`, `isLoading`             |
| **Computed**       | `sortedReviews`          | `filteredPokemons`, `isShowingFavorites`          |
| **Methods**        | `fetchReviews`, `submit` | `loadPokemons`, `toggleFavorite`, `setSearchTerm` |
| **rxMethod**       | `fetchReviews`, `submit` | `syncWithGlobalStore`                             |
| **Optimistic**     | `addEntity` on submit    | `optimisticallyUpdatePokemon`                     |
| **Error Handling** | Dispatch to global store | (handled in effects)                              |
| **Hooks**          | `onInit` - fetch reviews | `onInit` - load & sync                            |

## Advanced Patterns

### Pattern 1: Optimistic Updates

```typescript
// In local store
toggleFavoriteOptimistically(id: number): void {
  // 1. Optimistically update local entity
  patchState(store, updateEntity({
    id,
    changes: { isFavorite: !store.isPokemonFavorite()(id) }
  }));

  // 2. Dispatch to global store
  globalStore.dispatch(PokemonActions.toggleFavorite({ id }));

  // 3. If error in effects, revert via global store update
}
```

### Pattern 2: Pagination

```typescript
(withState({
  currentPage: 1,
  pageSize: 20,
}),
  withComputed((store) => ({
    paginatedPokemons: computed(() => {
      const filtered = store.filteredPokemons();
      const page = store.currentPage();
      const size = store.pageSize();
      const start = (page - 1) * size;
      return filtered.slice(start, start + size);
    }),
    totalPages: computed(() =>
      Math.ceil(store.filteredPokemons().length / store.pageSize()),
    ),
  })),
  withMethods((store) => ({
    nextPage(): void {
      patchState(store, { currentPage: store.currentPage() + 1 });
    },
    prevPage(): void {
      patchState(store, { currentPage: store.currentPage() - 1 });
    },
  })));
```

### Pattern 3: Multi-Select

```typescript
(withState({
  selectedIds: [] as number[],
}),
  withComputed((store) => ({
    selectedPokemons: computed(() => {
      const selected = store.selectedIds();
      return store.filteredPokemons().filter((p) => selected.includes(p.id));
    }),
  })),
  withMethods((store) => ({
    toggleSelection(id: number): void {
      const selected = store.selectedIds();
      patchState(store, {
        selectedIds: selected.includes(id)
          ? selected.filter((sid) => sid !== id)
          : [...selected, id],
      });
    },
    selectAll(): void {
      patchState(store, {
        selectedIds: store.filteredPokemons().map((p) => p.id),
      });
    },
    clearSelection(): void {
      patchState(store, { selectedIds: [] });
    },
  })));
```

## Testing

### Testing Local Store

```typescript
describe('PokemonListLocalStore', () => {
  it('should filter by search term', () => {
    const store = new PokemonListLocalStore();

    // Set search term
    store.setSearchTerm('pika');

    // Check filtered results
    expect(store.filteredPokemons()).toEqual([
      { id: 25, name: 'pikachu', ... }
    ]);
  });

  it('should toggle view mode', () => {
    const store = new PokemonListLocalStore();

    expect(store.isShowingFavorites()).toBe(false);

    store.setViewMode('favorites');

    expect(store.isShowingFavorites()).toBe(true);
  });
});
```

### Testing with Mock Global Store

```typescript
const mockStore = {
  selectSignal: jest.fn((selector) => {
    if (selector === selectAllPokemons) {
      return signal([...mockPokemons]);
    }
    return signal([]);
  }),
  dispatch: jest.fn(),
};

TestBed.configureTestingModule({
  providers: [{ provide: Store, useValue: mockStore }, PokemonListLocalStore],
});
```

## Migration Guide

### From Simple State to Entities

**Before (simple state):**

```typescript
withState({
  pokemons: [] as Pokemon[],
  searchTerm: '',
});
```

**After (with entities):**

```typescript
(withEntities<Pokemon>(),
  withState({
    searchTerm: '',
  }));
```

**Benefits:**

- Automatic ID management
- Efficient lookups
- Standardized CRUD operations

## Summary

✅ **Entity-Based Local Store Pattern:**

- Uses `withEntities<T>()` for collection management
- Reads from global store (source of truth)
- Manages feature-specific UI state
- Provides complex computed values
- Dispatches actions back to global store
- Uses `rxMethod` for async operations
- Lifecycle hooks for initialization

✅ **Result:**

- Cleaner components
- Better separation of concerns
- More testable code
- Scalable architecture
- Performance optimized

Your pokemon-list feature now follows the exact same pattern as your review store example! 🎉
