# Quick Reference Guide 🚀

## Project Structure

```
📦 pokedex/
├── 📁 pokemon/                        ← FEATURE MODULE
│   ├── 📄 pokemon.routes.ts          ← Lazy-loaded routes
│   │
│   ├── 📁 feature/                   ← SMART COMPONENTS (Container)
│   │   └── pokemon-container/
│   │       └── pokemon-container.component.ts
│   │           • Knows about NgRx Store ✅
│   │           • Dispatches actions ✅
│   │           • Selects data ✅
│   │           • Manages local UI state (NgRx Signals) ✅
│   │           • Passes data DOWN to dumb components ⬇️
│   │           • Handles events UP from dumb components ⬆️
│   │
│   ├── 📁 ui/                        ← DUMB COMPONENTS (Presentational)
│   │   ├── pokemon-card/             • input() for data ⬇️
│   │   ├── pokemon-list/             • output() for events ⬆️
│   │   └── pokemon-details/          • No Store knowledge ❌
│   │                                 • Pure presentation ✅
│   │                                 • OnPush ✅
│   │                                 • Highly reusable ♻️
│   │
│   ├── 📁 data-access/               ← DATA LAYER
│   │   ├── pokemon.service.ts        • HTTP calls to PokeAPI
│   │   └── store/
│   │       ├── pokemon.actions.ts    • Action creators
│   │       ├── pokemon.effects.ts    • Side effects (API calls)
│   │       ├── pokemon.reducer.ts    • State mutations
│   │       ├── pokemon.selectors.ts  • State queries
│   │       └── pokemon.state.ts      • State shape + Entity adapter
│   │
│   └── 📁 utils/                     ← Feature-specific utilities
│
└── 📁 shared/                        ← SHARED ACROSS FEATURES
    ├── data-access/
    │   └── models/                   • Global interfaces
    ├── ui/                           • Reusable components
    └── utils/                        • Helper functions
```

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  USER ACTION                                             │
│  (Click "Load Pokemons")                                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  SMART COMPONENT (pokemon-container.component.ts)        │
│  this.store.dispatch(PokemonActions.loadPokemons())      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  NGRX EFFECTS (pokemon.effects.ts)                       │
│  Listen for loadPokemons action                          │
│  ├─> Call PokemonService.getAllPokemons()                │
│  └─> Returns Observable<Pokemon[]>                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  API SERVICE (pokemon.service.ts)                        │
│  HTTP GET https://pokeapi.co/api/v2/pokemon?limit=150    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  NGRX EFFECTS (continued)                                │
│  Success: dispatch loadPokemonsSuccess({ pokemons })     │
│  Error:   dispatch loadPokemonsFailure({ error })        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  NGRX REDUCER (pokemon.reducer.ts)                       │
│  Update state with new pokemons                          │
│  state = { ...state, entities: {...}, loading: false }   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  NGRX SELECTORS (pokemon.selectors.ts)                   │
│  selectAllPokemons: Compute pokemons array from state    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  SMART COMPONENT (pokemon-container.component.ts)        │
│  pokemons = this.store.selectSignal(selectAllPokemons)   │
│  Signal updates automatically! 🎉                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  DUMB COMPONENT (pokemon-list.component.ts)              │
│  <app-pokemon-list [pokemons]="pokemons()" />            │
│  Receives data via @Input, renders UI                    │
└──────────────────────────────────────────────────────────┘
```

## Component Communication

```
┌─────────────────────────────────────────────────────┐
│   SMART COMPONENT                                   │
│   (pokemon-container.component.ts)                  │
│                                                     │
│   - store.dispatch(action)        ──►  NgRx Store  │
│   - store.selectSignal(selector)  ◄──  NgRx Store  │
│   - localStore.setViewMode()      ──►  Local State │
└───────────┬────────────────────┬────────────────────┘
            │                    │
    Props   │                    │  Events
    Down ⬇️  │                    │  Up ⬆️
            │                    │
┌───────────▼────────────────────▼────────────────────┐
│   DUMB COMPONENTS (UI Layer)                        │
│                                                     │
│   pokemon-list.component.ts                         │
│   - [pokemons]="pokemons()"           ◄── Input     │
│   - (onDetailsClick)="handler()"      ──► Output    │
│                                                     │
│   pokemon-card.component.ts                         │
│   - [pokemon]="pokemon"               ◄── Input     │
│   - (detailsClick)="emit()"           ──► Output    │
│                                                     │
│   pokemon-details.component.ts                      │
│   - [pokemon]="selectedPokemon()"     ◄── Input     │
│   - (close)="close()"                 ──► Output    │
└─────────────────────────────────────────────────────┘
```

## State Management

### Global State (NgRx Store)

**When to use:**

- Data from API
- Shared across routes/components
- Needs persistence
- Examples: pokemons list, favorites, selected pokemon

**Location:** `data-access/store/`

```typescript
// In smart component
allPokemons = this.store.selectSignal(selectAllPokemons);

ngOnInit() {
  this.store.dispatch(PokemonActions.loadPokemons());
}
```

### Local State (NgRx Signals)

**When to use:**

- UI-only state
- Component-specific
- Temporary state
- Examples: view mode, show/hide details, filters

**Location:** Within smart component

```typescript
const PokemonLocalStore = signalStore(
  withState({ viewMode: 'all', showDetails: false }),
  withMethods((store) => ({
    setViewMode(mode) {
      patchState(store, { viewMode: mode });
    },
  })),
);

// In component
localStore = inject(PokemonLocalStore);
localStore.setViewMode('favorites');
```

## File Organization Rules

### ✅ DO

```typescript
// ✅ Smart component imports from data-access
import { PokemonActions, selectAllPokemons } from '../../data-access';

// ✅ Smart component imports dumb components from ui
import { PokemonListComponent } from '../../ui';

// ✅ Dumb components import from shared
import type { Pokemon } from '../../../shared/data-access';

// ✅ Use barrel exports (index.ts)
export * from './pokemon-card.component';
```

### ❌ DON'T

```typescript
// ❌ Dumb component importing from store
import { PokemonActions } from '../../data-access/store';

// ❌ Deep imports bypassing index.ts
import { Pokemon } from '../../../shared/data-access/models/pokemon.model';

// ❌ Circular dependencies
// feature → ui → feature ❌

// ❌ Smart component with business logic
// Keep them thin, delegate to services/store
```

## Common Tasks

### Add a New Smart Component

```bash
# 1. Create in feature/
touch src/app/pokemon/feature/pokemon-filter/pokemon-filter.component.ts

# 2. Inject Store and Local Store
# 3. Select data, dispatch actions
# 4. Pass to dumb components
```

### Add a New Dumb Component

```bash
# 1. Create in ui/
mkdir -p src/app/pokemon/ui/pokemon-badge
touch src/app/pokemon/ui/pokemon-badge/pokemon-badge.component.ts

# 2. Use input() and output() only
# 3. Add to ui/index.ts
# 4. Use OnPush change detection
```

### Add a New Action/Effect

```typescript
// 1. Add to pokemon.actions.ts
'Load Pokemon Stats': props<{ id: number }>(),
'Load Pokemon Stats Success': props<{ stats: Stats }>(),

// 2. Add effect in pokemon.effects.ts
loadPokemonStats$ = createEffect(() =>
  this.actions$.pipe(
    ofType(PokemonActions.loadPokemonStats),
    switchMap(/* API call */)
  )
);

// 3. Handle in reducer
on(PokemonActions.loadPokemonStatsSuccess, /* update state */);

// 4. Add selector if needed
export const selectPokemonStats = createSelector(/* ... */);
```

## Checklist for New Features

- [ ] Routes defined in `feature.routes.ts`
- [ ] Smart component in `feature/`
- [ ] Dumb components in `ui/`
- [ ] Services in `data-access/`
- [ ] Store files (actions, effects, reducer, selectors, state) in `data-access/store/`
- [ ] Models in `shared/data-access/models/` (if reusable)
- [ ] Barrel exports (`index.ts`) created
- [ ] OnPush change detection everywhere
- [ ] No circular dependencies
- [ ] Build succeeds: `npm run build`
- [ ] Linter passes: `npm run lint:check`

## Import Paths Cheat Sheet

```typescript
// From smart component (feature/)
import { ... } from '../../data-access';        // Store, service
import { ... } from '../../ui';                 // Dumb components
import { ... } from '../../../shared/data-access'; // Models

// From dumb component (ui/)
import { ... } from '../../../shared/data-access'; // Models
import { ... } from '../other-component';       // Other dumb components

// From service/store (data-access/)
import { ... } from '../../shared/data-access'; // Models
```

## Performance Tips

✅ **OnPush everywhere** - All components use `ChangeDetectionStrategy.OnPush`
✅ **Lazy loading** - Features loaded on demand via routes
✅ **Entity Adapter** - Normalized state for O(1) lookups
✅ **Memoized Selectors** - Computed only when inputs change
✅ **Signals** - Fine-grained reactivity without zone.js overhead
✅ **Smart/Dumb split** - Dumb components are pure, highly optimized

## Debugging Tips

### Check State

```typescript
// In browser console
window['store'] = inject(Store); // Add in app.component.ts
store.select(selectAllPokemons).subscribe(console.log);
```

### Redux DevTools

Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)

- Time-travel debugging
- View all actions
- Inspect state

### Nx Graph

```bash
npx nx graph
```

View project dependencies visually

## Resources

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture guide
- 📖 [NGRX_IMPLEMENTATION.md](./NGRX_IMPLEMENTATION.md) - NgRx setup guide
- 📖 [data-access/store/USAGE_EXAMPLES.md](./src/app/pokemon/data-access/store/USAGE_EXAMPLES.md) - Code examples
