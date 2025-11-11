import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import type { Pokemon } from '../../shared/data-access/models/pokemon.model';

interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
}

interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  getAllPokemons(limit = 20, offset = 0): Observable<Pokemon[]> {
    return this.http
      .get<PokeApiListResponse>(
        `${this.apiUrl}?limit=${limit}&offset=${offset}`,
      )
      .pipe(
        map((response) =>
          response.results.map((pokemon) => {
            const id = this.extractIdFromUrl(pokemon.url);
            return {
              id,
              name: pokemon.name,
              height: 0,
              weight: 0,
            };
          }),
        ),
      );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<PokeApiPokemon>(`${this.apiUrl}/${id}`).pipe(
      map((pokemon) => ({
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
      })),
    );
  }

  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1], 10) : 0;
  }
}
