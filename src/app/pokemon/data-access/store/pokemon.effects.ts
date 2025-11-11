import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PokemonService } from '../pokemon.service';
import { PokemonActions } from './pokemon.actions';

@Injectable()
export class PokemonEffects {
  private actions$ = inject(Actions);
  private pokemonService = inject(PokemonService);

  loadPokemons$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PokemonActions.loadPokemons),
      switchMap(() =>
        this.pokemonService.getAllPokemons(150).pipe(
          map((pokemons) => PokemonActions.loadPokemonsSuccess({ pokemons })),
          catchError((error) =>
            of(
              PokemonActions.loadPokemonsFailure({
                error: error.message || 'Failed to load pokemons',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadPokemonById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PokemonActions.loadPokemonById),
      switchMap(({ id }) =>
        this.pokemonService.getPokemonById(id).pipe(
          map((pokemon) => PokemonActions.loadPokemonByIdSuccess({ pokemon })),
          catchError((error) =>
            of(
              PokemonActions.loadPokemonByIdFailure({
                error: error.message || 'Failed to load pokemon',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
