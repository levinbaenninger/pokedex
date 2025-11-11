# Architecture Documentation 🏗️

## Overview

This Pokédex application follows a **feature-sliced design** with **smart/dumb component architecture** for maximum maintainability and scalability.

## Folder Structure

```
src/app/
├── pokemon/                           # Feature: Pokemon
│   ├── pokemon.routes.ts             # Feature routes
│   ├── feature/                      # Smart/Container components
│   │   └── pokemon-container/
│   │       └── pokemon-container.component.ts
│   ├── ui/                           # Dumb/Presentational components
│   │   ├── index.ts
│   │   ├── pokemon-card/
│   │   │   └── pokemon-card.component.ts
│   │   ├── pokemon-list/
│   │   │   └── pokemon-list.component.ts
│   │   └── pokemon-details/
│   │       └── pokemon-details.component.ts
│   ├── data-access/                  # Data layer (services, store)
│   │   ├── index.ts
│   │   ├── pokemon.service.ts
│   │   └── store/
│   │       ├── index.ts
│   │       ├── pokemon.actions.ts
│   │       ├── pokemon.effects.ts
│   │       ├── pokemon.reducer.ts
│   │       ├── pokemon.selectors.ts
│   │       ├── pokemon.state.ts
│   │       └── USAGE_EXAMPLES.md
│   └── utils/                        # Feature-specific utilities
│
└── shared/                           # Shared across features
    ├── data-access/                  # Global models & services
    │   ├── index.ts
    │   └── models/
    │       ├── pokemon.model.ts
    │       └── request-status.model.ts
    ├── ui/                           # Shared UI components
    └── utils/                        # Shared utilities
```

## Architecture Principles

### 1. **Feature-Sliced Design**

Each feature (e.g., `pokemon`) is self-contained with its own:

- Routes
- Components (smart & dumb)
- Data access layer
- Utilities

### 2. **Smart/Dumb Component Pattern**

#### **Smart Components** (Container Components)

Location: `feature/`

**Responsibilities:**

- ✅ Know about NgRx Store
- ✅ Dispatch actions
- ✅ Select data from store
- ✅ Manage NgRx Signals for local UI state
- ✅ Pass data to dumb components
- ✅ Handle events from dumb components

**Example:**

```typescript
@Component({
  selector: 'app-pokemon-container',
  providers: [PokemonLocalStore],
  template: `
    <app-pokemon-list
      [pokemons]="displayedPokemons()"
      [favoriteIds]="favoriteIds()"
      (onDetailsClick)="loadPokemonDetails($event)"
      (onFavoriteToggle)="toggleFavorite($event)"
    />
  `
})
export class PokemonContainerComponent {
  private store = inject(Store);
  localStore = inject(PokemonLocalStore);

  displayedPokemons = computed(() => /* ... */);

  toggleFavorite(id: number): void {
    this.store.dispatch(PokemonActions.toggleFavorite({ id }));
  }
}
```

#### **Dumb Components** (Presentational Components)

Location: `ui/`

**Responsibilities:**

- ✅ Pure presentation logic
- ✅ Receive data via `input()`
- ✅ Emit events via `output()`
- ✅ No knowledge of store/state management
- ✅ OnPush change detection
- ✅ Highly reusable

**Example:**

```typescript
@Component({
  selector: 'app-pokemon-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card>
      <h3>{{ pokemon().name }}</h3>
      <p-button (onClick)="detailsClick.emit(pokemon().id)" />
    </p-card>
  `,
})
export class PokemonCardComponent {
  pokemon = input.required<Pokemon>();
  isFavorite = input<boolean>(false);

  detailsClick = output<number>();
  favoriteToggle = output<number>();
}
```

### 3. **Data Access Layer**

Location: `data-access/`

**Contains:**

- Feature-specific services
- NgRx store (actions, effects, reducers, selectors, state)
- API integrations

**Why separate?**

- Clear separation of concerns
- Easy to test
- Can be shared across multiple smart components
- Encapsulates all data logic

### 4. **Shared Module**

Location: `shared/`

**Purpose:**

- Code reused across multiple features
- Global models/interfaces
- Common UI components
- Shared utilities

**Structure:**

```
shared/
├── data-access/        # Global models, services
├── ui/                 # Reusable components
└── utils/              # Helper functions
```

## Component Communication Flow

```
┌─────────────────────────────────────────┐
│   Smart Component (Container)           │
│   - Knows about Store                   │
│   - Dispatches actions                  │
│   - Selects data                        │
└───────────┬─────────────────────────────┘
            │
            │ Props Down ⬇️
            │ Events Up   ⬆️
            │
┌───────────▼─────────────────────────────┐
│   Dumb Component (Presentational)       │
│   - Receives data via @Input()          │
│   - Emits events via @Output()          │
│   - No store knowledge                  │
└─────────────────────────────────────────┘
```

## State Management Architecture

### Global State (NgRx Store)

**Location:** `data-access/store/`

**Used for:**

- Data shared across routes/components
- Data from API calls
- Application-wide state (e.g., favorites)

**Example:**

```typescript
// In smart component
pokemons = this.store.selectSignal(selectAllPokemons);

loadPokemons(): void {
  this.store.dispatch(PokemonActions.loadPokemons());
}
```

### Local State (NgRx Signals)

**Location:** Within smart components

**Used for:**

- UI-specific state (modals, tabs, filters)
- Component-local toggles
- Temporary form state

**Example:**

```typescript
const PokemonLocalStore = signalStore(
  withState({ viewMode: 'all', showDetails: false }),
  withMethods((store) => ({
    setViewMode(mode: 'all' | 'favorites'): void {
      patchState(store, { viewMode: mode });
    },
  })),
);
```

## Import Strategy

Each layer exports a public API via `index.ts`:

```typescript
// pokemon/data-access/index.ts
export * from './store';
export * from './pokemon.service';

// pokemon/ui/index.ts
export * from './pokemon-card/pokemon-card.component';
export * from './pokemon-list/pokemon-list.component';
export * from './pokemon-details/pokemon-details.component';
```

**Usage:**

```typescript
// ✅ Good: Clean imports via barrel files
import { PokemonActions, selectAllPokemons } from '../../data-access';
import { PokemonListComponent } from '../../ui';

// ❌ Bad: Deep imports
import { PokemonActions } from '../../data-access/store/pokemon.actions';
```

## Benefits of This Architecture

### 🎯 **Maintainability**

- Clear separation of concerns
- Easy to locate code
- Predictable structure

### 🧪 **Testability**

- Dumb components are pure functions
- Easy to mock store in smart components
- Isolated data access layer

### ♻️ **Reusability**

- Dumb components highly reusable
- Shared module prevents duplication
- Feature-specific code stays isolated

### 📈 **Scalability**

- Easy to add new features
- No risk of circular dependencies
- Clear boundaries between layers

### 🚀 **Performance**

- OnPush change detection everywhere
- Lazy loading per feature
- NgRx Entity for optimized collections

## Adding a New Feature

Follow this checklist:

1. **Create feature folder structure:**

```bash
mkdir -p src/app/my-feature/{feature,ui,data-access,utils}
```

2. **Add routes:**

```typescript
// my-feature/my-feature.routes.ts
export const myFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/my-container.component'),
  },
];
```

3. **Create smart component:**

```typescript
// my-feature/feature/my-container/my-container.component.ts
// - Inject Store
// - Create local store if needed
// - Select data, dispatch actions
// - Pass to dumb components
```

4. **Create dumb components:**

```typescript
// my-feature/ui/my-item/my-item.component.ts
// - Use input() and output()
// - OnPush change detection
// - Pure presentation
```

5. **Add data access:**

```typescript
// my-feature/data-access/
// - Add service
// - Add store (actions, effects, reducer, selectors, state)
```

6. **Create index.ts files:**

```typescript
// Export public APIs for clean imports
```

## Best Practices

### ✅ DO

- Keep dumb components pure and simple
- Use OnPush change detection everywhere
- Export public APIs via index.ts
- Keep smart components thin (delegate to services/store)
- Use NgRx Signals for local UI state
- Use NgRx Store for shared/persistent state

### ❌ DON'T

- Don't inject Store in dumb components
- Don't put business logic in dumb components
- Don't skip the data-access layer
- Don't create circular dependencies
- Don't mix global and local state concerns

## Migration from Flat Structure

If you have a flat component structure:

1. **Identify smart vs dumb:**
   - Does it use Store? → Smart (move to `feature/`)
   - Pure presentation? → Dumb (move to `ui/`)

2. **Extract data logic:**
   - Move services to `data-access/`
   - Move store files to `data-access/store/`

3. **Break down large components:**
   - Extract presentational parts to `ui/`
   - Keep orchestration in smart component

4. **Update imports:**
   - Create index.ts files
   - Update all imports to use barrel files

## Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Smart vs Dumb Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [NgRx Store](https://ngrx.io/guide/store)
- [NgRx Signals](https://ngrx.io/guide/signals)
