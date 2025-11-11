import type { Route } from '@angular/router';

export const pokemonRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/pokemon-list/pokemon-list.component').then(
        (m) => m.PokemonListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./feature/pokemon-detail/pokemon-detail.component').then(
        (m) => m.PokemonDetailComponent,
      ),
  },
];
