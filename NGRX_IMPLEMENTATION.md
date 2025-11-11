# NgRx Implementation Guide 🎮

## Overview

This Pokédex application now has a complete NgRx implementation featuring:

- ✅ **NgRx Store** for global state management
- ✅ **NgRx Entity** for normalized Pokemon data
- ✅ **NgRx Effects** for external API interactions
- ✅ **NgRx Signals** for local component state
- ✅ **NgRx Router Store** integration
- ✅ **NgRx Operators** for reactive state transformations

## Architecture

This application follows **feature-sliced design** with **smart/dumb component architecture**.

```
src/app/
├── pokemon/                           # Feature module
│   ├── pokemon.routes.ts
│   ├── feature/                      # Smart components
│   │   └── pokemon-container/
│   │       └── pokemon-container.component.ts
│   ├── ui/                           # Dumb components
│   │   ├── pokemon-card/
│   │   ├── pokemon-list/
│   │   └── pokemon-details/
│   ├── data-access/                  # Data layer
│   │   ├── pokemon.service.ts
│   │   └── store/
│   │       ├── pokemon.actions.ts
│   │       ├── pokemon.effects.ts
│   │       ├── pokemon.reducer.ts
│   │       ├── pokemon.selectors.ts
│   │       └── pokemon.state.ts
│   └── utils/
└── shared/                           # Shared across features
    ├── data-access/
    │   └── models/
    │       ├── pokemon.model.ts
    │       └── request-status.model.ts
    ├── ui/
    └── utils/
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Features

### 1. **Fetch All Pokemons** 🗂️

```typescript
// Dispatch the action
this.store.dispatch(PokemonActions.loadPokemons());

// Select the data
this.allPokemons = this.store.selectSignal(selectAllPokemons);
```

### 2. **Fetch Pokemon by ID** 🔍

```typescript
// Dispatch the action
this.store.dispatch(PokemonActions.loadPokemonById({ id: 25 }));

// Select the selected pokemon
this.selectedPokemon = this.store.selectSignal(selectSelectedPokemon);
```

### 3. **Favorite Pokemons** ⭐

```typescript
// Toggle favorite status
this.store.dispatch(PokemonActions.toggleFavorite({ id: 25 }));

// Select favorite pokemons
this.favoritePokemons = this.store.selectSignal(selectFavoritePokemons);

// Check if pokemon is favorite
const isFavorite = this.store.selectSignal(selectIsPokemonFavorite(25));
```

## Store Structure

### State Shape

```typescript
interface PokemonState {
  // Entity state (normalized data)
  ids: number[];
  entities: { [id: number]: Pokemon };

  // UI state
  selectedPokemonId: number | null;
  favoriteIds: number[];
  loading: boolean;
  error: string | null;
}
```

### Available Actions

```typescript
// Load all pokemons
PokemonActions.loadPokemons()
PokemonActions.loadPokemonsSuccess({ pokemons: Pokemon[] })
PokemonActions.loadPokemonsFailure({ error: string })

// Load single pokemon
PokemonActions.loadPokemonById({ id: number })
PokemonActions.loadPokemonByIdSuccess({ pokemon: Pokemon })
PokemonActions.loadPokemonByIdFailure({ error: string })

// Favorite management
PokemonActions.toggleFavorite({ id: number })

// Error handling
PokemonActions.clearError()
```

### Available Selectors

```typescript
// Entity selectors
selectAllPokemons; // All pokemons as array
selectPokemonEntities; // Pokemons as dictionary
selectPokemonIds; // All pokemon IDs
selectPokemonTotal; // Total count

// Custom selectors
selectPokemonLoading; // Loading state
selectPokemonError; // Error message
selectFavoriteIds; // Favorite pokemon IDs
selectFavoritePokemons; // Favorite pokemons array
selectSelectedPokemonId; // Currently selected ID
selectSelectedPokemon; // Currently selected pokemon
selectIsPokemonFavorite(id); // Check if specific pokemon is favorite
```

## NgRx Signals for Local State

The Pokemon component uses NgRx Signals for UI-specific local state:

```typescript
const PokemonLocalStore = signalStore(
  withState({
    searchTerm: '',
    viewMode: 'all' | 'favorites',
    showDetails: boolean
  }),
  withComputed(({ viewMode, searchTerm }) => ({
    isShowingFavorites: computed(() => viewMode() === 'favorites'),
    hasSearchTerm: computed(() => searchTerm().length > 0),
  })),
  withMethods((store) => ({
    setViewMode(mode: 'all' | 'favorites'): void,
    setShowDetails(show: boolean): void,
    setSearchTerm(term: string): void,
  }))
);
```

### Usage in Component

```typescript
@Component({
  providers: [PokemonLocalStore]
})
export class PokemonComponent {
  localStore = inject(PokemonLocalStore);

  // Access state
  viewMode = this.localStore.viewMode();

  // Update state
  this.localStore.setViewMode('favorites');
}
```

## Effects

Effects handle all external interactions:

```typescript
// Load all pokemons effect
loadPokemons$ = createEffect(() =>
  this.actions$.pipe(
    ofType(PokemonActions.loadPokemons),
    switchMap(() =>
      this.pokemonService.getAllPokemons(150).pipe(
        map((pokemons) => PokemonActions.loadPokemonsSuccess({ pokemons })),
        catchError((error) =>
          of(PokemonActions.loadPokemonsFailure({ error })),
        ),
      ),
    ),
  ),
);
```

## Component Architecture

### Smart/Dumb Component Pattern

The application uses smart (container) and dumb (presentational) components:

#### **Smart Component** (`pokemon-container.component.ts`)

- Located in `feature/` folder
- Knows about NgRx Store
- Manages global state (pokemons, favorites) via Store
- Manages local UI state via NgRx Signals
- Passes data to dumb components via `@Input()`
- Handles events from dumb components

#### **Dumb Components** (UI layer)

- Located in `ui/` folder
- Pure presentational logic
- Receive data via `input()`
- Emit events via `output()`
- No knowledge of store
- Highly reusable and testable

**Components:**

1. `pokemon-list` - Displays grid of pokemon cards
2. `pokemon-card` - Displays single pokemon with actions
3. `pokemon-details` - Shows detailed pokemon information

### Component Integration

1. **Global State** (NgRx Store): Pokemon data, favorites, loading/error states
2. **Local State** (NgRx Signals): View mode, UI toggles, search
3. **Reactive Updates**: All UI automatically updates when state changes
4. **OnPush Strategy**: Optimized change detection everywhere

## Running the App

```bash
# Start development server
npm start

# Build for production
npm run build

# Run linting
npm run lint:check
```

## API Integration

The app uses the public PokeAPI:

- **Base URL**: `https://pokeapi.co/api/v2/pokemon`
- **List Endpoint**: `/pokemon?limit=150`
- **Detail Endpoint**: `/pokemon/{id}`

## Best Practices Applied

✅ Standalone components (no NgModules)
✅ Signals for reactivity
✅ OnPush change detection
✅ Entity adapter for normalized state
✅ Effects for side effects
✅ Proper error handling
✅ Type safety throughout
✅ Separation of concerns (global vs local state)

## Next Steps

Consider adding:

- 🔍 Search functionality using local store
- 📄 Pagination for pokemon list
- 🎨 Pokemon sprites/images
- 💾 LocalStorage persistence for favorites
- 🧪 Unit tests for store, effects, and selectors
- 📱 Responsive design improvements
