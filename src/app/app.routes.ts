import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'pokemon',
    loadChildren: () =>
      import('./pokemon/pokemon.routes').then((m) => m.pokemonRoutes),
  },
  {
    path: '',
    redirectTo: 'pokemon',
    pathMatch: 'full',
  },
];
