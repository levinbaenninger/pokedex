# Feature-Based Architecture 🏗️

## Overview

This Pokédex application follows **feature-sliced design** where each **feature** is a **routed page** (smart component) that orchestrates dumb UI components.

## ✨ Key Concept

**Feature = Routed Smart Component**

Each feature represents a distinct page/route in your application:

- `pokemon-list` → Route: `/pokemon` (List page)
- `pokemon-detail` → Route: `/pokemon/:id` (Detail page)

## 📦 Structure

```
src/app/
└── pokemon/                           ✅ FEATURE MODULE
    ├── pokemon.routes.ts              # Route definitions
    │
    ├── feature/                       # 🧠 ROUTED SMART COMPONENTS (Features)
    │   ├── pokemon-list/
    │   │   └── pokemon-list.component.ts
    │   │       • Route: /pokemon
    │   │       • Shows list of all pokemons
    │   │       • Manages list-specific state (filters, view modes)
    │   │       • Uses: pokemon-grid, buttons
    │   │
    │   └── pokemon-detail/
    │       └── pokemon-detail.component.ts
    │           • Route: /pokemon/:id
    │           • Shows single pokemon detail
    │           • Loads pokemon by route param
    │           • Uses: pokemon-info
    │
    ├── ui/                            # 🎨 DUMB PRESENTATIONAL COMPONENTS
    │   ├── pokemon-card/
    │   │   └── pokemon-card.component.ts
    │   │       • Displays single pokemon in card format
    │   │       • input: pokemon, isFavorite
    │   │       • output: detailsClick, favoriteToggle
    │   │
    │   ├── pokemon-grid/
    │   │   └── pokemon-list.component.ts
    │   │       • Displays grid of pokemon cards
    │   │       • input: pokemons[], favoriteIds[]
    │   │       • output: onDetailsClick, onFavoriteToggle
    │   │
    │   └── pokemon-info/
    │       └── pokemon-details.component.ts
    │           • Displays detailed pokemon information
    │           • input: pokemon, isFavorite
    │           • output: favoriteToggle
    │
    ├── data-access/                   # 💾 DATA LAYER
    │   ├── pokemon.service.ts         # HTTP service
    │   └── store/                     # NgRx store
    │       ├── pokemon.actions.ts
    │       ├── pokemon.effects.ts
    │       ├── pokemon.reducer.ts
    │       ├── pokemon.selectors.ts
    │       └── pokemon.state.ts
    │
    └── utils/                         # 🛠️ Feature-specific utilities
```

## 🎯 Component Hierarchy

### Feature: Pokemon List (Route: `/pokemon`)

```
pokemon-list.component.ts (SMART - Routed)
    ├── [Knows about Store, Router, NgRx Signals]
    ├── Dispatches: loadPokemons, toggleFavorite
    ├── Navigates: router.navigate(['/pokemon', id])
    │
    └── pokemon-grid.component.ts (DUMB)
            ├── [Pure presentation, no store]
            └── pokemon-card.component.ts (DUMB)
                    └── [Pure presentation, no store]
```

### Feature: Pokemon Detail (Route: `/pokemon/:id`)

```
pokemon-detail.component.ts (SMART - Routed)
    ├── [Knows about Store, Router, ActivatedRoute]
    ├── Reads route param: pokemonId from :id
    ├── Dispatches: loadPokemonById, toggleFavorite
    ├── Navigates: router.navigate(['/pokemon'])
    │
    └── pokemon-info.component.ts (DUMB)
            └── [Pure presentation, no store]
```

## 🛣️ Routes Configuration

```typescript
// pokemon.routes.ts
export const pokemonRoutes: Route[] = [
  {
    path: '', // /pokemon
    loadComponent: () => import('./feature/pokemon-list/...'),
  },
  {
    path: ':id', // /pokemon/:id
    loadComponent: () => import('./feature/pokemon-detail/...'),
  },
];
```

## 📊 Data Flow

### List Page Flow

```
USER clicks "View Pokemons"
    ↓
ROUTER navigates to /pokemon
    ↓
POKEMON-LIST (Feature - Smart)
    ↓ ngOnInit: dispatch(loadPokemons)
NGRX EFFECTS
    ↓ HTTP call via PokemonService
POKEAPI
    ↓ response
REDUCER updates state
    ↓
POKEMON-LIST (signal updates)
    ↓ [pokemons]="displayedPokemons()"
POKEMON-GRID (Dumb)
    ↓ @for pokemon
POKEMON-CARD (Dumb)
    ↓ render card
USER sees pokemon list
```

### Detail Page Flow

```
USER clicks "Details" on a card
    ↓
POKEMON-LIST: navigateToDetail(id)
    ↓ router.navigate(['/pokemon', id])
ROUTER navigates to /pokemon/25
    ↓
POKEMON-DETAIL (Feature - Smart)
    ↓ Read route param: pokemonId = 25
    ↓ ngOnInit: dispatch(loadPokemonById({ id: 25 }))
NGRX EFFECTS
    ↓ HTTP call via PokemonService
POKEAPI
    ↓ response
REDUCER updates selectedPokemon
    ↓
POKEMON-DETAIL (signal updates)
    ↓ [pokemon]="selectedPokemon()"
POKEMON-INFO (Dumb)
    ↓ render detail view
USER sees pokemon details
```

## 🧩 Component Responsibilities

### Smart Components (Features - in `feature/`)

**Purpose:** Routed pages that orchestrate business logic

**Responsibilities:**

- ✅ Defined as routes in `pokemon.routes.ts`
- ✅ Know about NgRx Store (inject Store)
- ✅ Know about Router (inject Router, ActivatedRoute)
- ✅ Dispatch actions (load data, update state)
- ✅ Select data from store using signals
- ✅ Manage local UI state (NgRx Signals)
- ✅ Handle navigation (router.navigate)
- ✅ Read route parameters (ActivatedRoute)
- ✅ Pass data DOWN to dumb components via inputs
- ✅ Handle events UP from dumb components via outputs

**Example:**

```typescript
@Component({
  selector: 'app-pokemon-list',
  template: `
    <app-pokemon-grid
      [pokemons]="displayedPokemons()"
      (onDetailsClick)="navigateToDetail($event)"
    />
  `,
})
export class PokemonListComponent {
  private store = inject(Store);
  private router = inject(Router);

  pokemons = this.store.selectSignal(selectAllPokemons);

  navigateToDetail(id: number) {
    this.router.navigate(['/pokemon', id]);
  }
}
```

### Dumb Components (in `ui/`)

**Purpose:** Pure presentational components

**Responsibilities:**

- ✅ Receive data via `input()`
- ✅ Emit events via `output()`
- ❌ NO Store knowledge
- ❌ NO Router knowledge
- ❌ NO Service injection
- ✅ Pure presentation logic only
- ✅ OnPush change detection
- ✅ Highly reusable across features

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
  detailsClick = output<number>();
}
```

## 🆕 Adding New Features

### Example: Add "Pokemon Compare" Feature

**Goal:** Create a page at `/pokemon/compare` that compares two pokemons

**Step 1: Create Feature Component**

```bash
touch src/app/pokemon/feature/pokemon-compare/pokemon-compare.component.ts
```

```typescript
// pokemon-compare.component.ts
@Component({
  selector: 'app-pokemon-compare',
  template: `
    <div class="flex gap-4">
      <app-pokemon-info [pokemon]="pokemon1()" />
      <app-pokemon-info [pokemon]="pokemon2()" />
    </div>
  `
})
export class PokemonCompareComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  // Read ?id1=25&id2=26 from query params
  pokemonIds = toSignal(
    this.route.queryParams.pipe(
      map(params => ({ id1: +params['id1'], id2: +params['id2'] }))
    )
  );

  pokemon1 = computed(() => /* select from store */);
  pokemon2 = computed(() => /* select from store */);

  ngOnInit() {
    const { id1, id2 } = this.pokemonIds()!;
    this.store.dispatch(PokemonActions.loadPokemonById({ id: id1 }));
    this.store.dispatch(PokemonActions.loadPokemonById({ id: id2 }));
  }
}
```

**Step 2: Add Route**

```typescript
// pokemon.routes.ts
export const pokemonRoutes: Route[] = [
  { path: '', loadComponent: () => import('./feature/pokemon-list/...') },
  {
    path: 'compare',
    loadComponent: () => import('./feature/pokemon-compare/...'),
  },
  { path: ':id', loadComponent: () => import('./feature/pokemon-detail/...') },
];
```

**Step 3: Add Navigation**

```typescript
// In pokemon-list.component.ts
comparePokemons(id1: number, id2: number) {
  this.router.navigate(['/pokemon/compare'], {
    queryParams: { id1, id2 }
  });
}
```

Done! ✅

## 🎨 UI Component Reusability

Dumb components in `ui/` can be reused across multiple features:

```typescript
// ✅ pokemon-info used in TWO features:

// Feature 1: pokemon-detail
@Component({
  template: `<app-pokemon-info [pokemon]="pokemon()" />`,
})
export class PokemonDetailComponent {}

// Feature 2: pokemon-compare
@Component({
  template: `
    <app-pokemon-info [pokemon]="pokemon1()" />
    <app-pokemon-info [pokemon]="pokemon2()" />
  `,
})
export class PokemonCompareComponent {}
```

## 🧪 Testing Strategy

### Testing Smart Components (Features)

**Focus:** Integration with store, routing, orchestration

```typescript
describe('PokemonListComponent', () => {
  it('should load pokemons on init', () => {
    const store = TestBed.inject(Store);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    component.ngOnInit();

    expect(dispatchSpy).toHaveBeenCalledWith(PokemonActions.loadPokemons());
  });

  it('should navigate to detail page', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.navigateToDetail(25);

    expect(navigateSpy).toHaveBeenCalledWith(['/pokemon', 25]);
  });
});
```

### Testing Dumb Components (UI)

**Focus:** Input/output, pure presentation logic

```typescript
describe('PokemonCardComponent', () => {
  it('should emit detailsClick when button clicked', () => {
    const emitSpy = jest.spyOn(component.detailsClick, 'emit');

    component.pokemon.set({ id: 25, name: 'pikachu' });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitSpy).toHaveBeenCalledWith(25);
  });
});
```

## 📏 Naming Conventions

### Features (Routed Pages)

- Named after the page/screen: `pokemon-list`, `pokemon-detail`, `pokemon-compare`
- Located in `feature/[feature-name]/[feature-name].component.ts`
- Selector: `app-[feature-name]`

### UI Components (Dumb)

- Named after what they display: `pokemon-card`, `pokemon-grid`, `pokemon-info`
- Located in `ui/[component-name]/[old-filename].component.ts`
- Selector: `app-[component-name]`

### Avoid Conflicts

- ✅ Feature: `pokemon-list` (shows list page)
- ✅ UI: `pokemon-grid` (displays grid of cards)
- ❌ Both named `pokemon-list` would conflict

## 🚀 Benefits

### Clear Mental Model

- **Feature = Page** → Easy to understand
- One folder = One route
- Matches user's navigation

### Scalability

- Add features independently
- No naming conflicts
- Clear boundaries

### Team Collaboration

- Designer: "Where's the list page?" → `feature/pokemon-list`
- Developer: "Where's the card component?" → `ui/pokemon-card`
- Clear ownership

### Code Reusability

- Dumb components used across features
- Features stay independent
- Easy to extract to library

## 📋 Checklist: New Feature

When adding a new routed page:

- [ ] Create folder: `feature/[feature-name]/`
- [ ] Create component: `[feature-name].component.ts`
- [ ] Add route in `pokemon.routes.ts`
- [ ] Inject Store, Router if needed
- [ ] Select data using `store.selectSignal()`
- [ ] Dispatch actions in lifecycle hooks
- [ ] Pass data to dumb components via inputs
- [ ] Handle navigation via `router.navigate()`
- [ ] Use existing dumb components from `ui/`
- [ ] Create new dumb components if needed
- [ ] OnPush change detection
- [ ] Test build: `npm run build`

## 🎯 Real-World Example

**Current Structure:**

```
Routes:
  /pokemon           → pokemon-list.component.ts
  /pokemon/:id       → pokemon-detail.component.ts

Components:
  pokemon-list       → Smart: manages list, navigation
  pokemon-detail     → Smart: manages detail, route params
  pokemon-grid       → Dumb: displays grid of cards
  pokemon-card       → Dumb: displays single card
  pokemon-info       → Dumb: displays detail info
```

**Data Flow:**

1. User visits `/pokemon`
2. `pokemon-list` feature loads
3. Dispatches `loadPokemons()`
4. Renders `pokemon-grid` with data
5. Grid renders multiple `pokemon-card`
6. User clicks card
7. `pokemon-list` navigates to `/pokemon/25`
8. `pokemon-detail` feature loads
9. Reads route param `:id = 25`
10. Dispatches `loadPokemonById({ id: 25 })`
11. Renders `pokemon-info` with data

## 📚 Summary

**Feature-Based Architecture:**

- ✅ Features are routed smart components
- ✅ Each feature represents a page/screen
- ✅ Features orchestrate dumb UI components
- ✅ Clear separation: feature/ (smart) vs ui/ (dumb)
- ✅ Easy to add, test, and maintain
- ✅ Scales with application growth

**Remember:**

- **Feature** = Routed page with business logic
- **UI Component** = Reusable presentational component
- Data flows DOWN, events flow UP
- Keep it simple, keep it clean! 🎯
