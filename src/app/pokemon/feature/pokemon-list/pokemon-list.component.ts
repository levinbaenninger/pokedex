import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPokemonLoading, selectPokemonError } from '../../data-access';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { PokemonGridComponent } from '../../ui';
import { PokemonListLocalStore } from './pokemon-list.store';

@Component({
  selector: 'app-pokemon-list',
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    PokemonGridComponent,
  ],
  providers: [PokemonListLocalStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-4xl font-bold mb-6">Pokédex 🎮</h1>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          pInputText
          type="text"
          placeholder="Search pokemons..."
          [value]="localStore.searchTerm()"
          (input)="onSearchChange($any($event.target).value)"
          class="w-full"
        />
      </div>

      <!-- View Mode Toggle -->
      <div class="mb-4 flex gap-2">
        <p-button
          [label]="'All Pokemons'"
          [severity]="localStore.isShowingFavorites() ? 'secondary' : 'primary'"
          (onClick)="localStore.setViewMode('all')"
        />
        <p-button
          [label]="'Favorites ⭐'"
          [severity]="localStore.isShowingFavorites() ? 'primary' : 'secondary'"
          (onClick)="localStore.setViewMode('favorites')"
        />
        @if (localStore.hasSearchTerm()) {
          <p-button
            icon="pi pi-times"
            [label]="'Clear Search'"
            severity="secondary"
            (onClick)="localStore.clearSearch()"
          />
        }
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center p-8">
          <p-progressSpinner />
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <p-message severity="error" [text]="error()!" />
      }

      <!-- Pokemon Grid -->
      @if (!loading() && !error()) {
        <app-pokemon-grid
          [pokemons]="localStore.filteredPokemons()"
          [favoriteIds]="localStore.favoriteIds()"
          (detailsClick)="navigateToDetail($event)"
          (favoriteToggle)="localStore.toggleFavorite($event)"
        />
      }

      <!-- Empty State -->
      @if (
        !loading() && !error() && localStore.filteredPokemons().length === 0
      ) {
        <p-message
          severity="info"
          text="No pokemons found. Try adjusting your filters."
        />
      }
    </div>
  `,
})
export class PokemonListComponent {
  private router = inject(Router);
  private store = inject(Store);
  localStore = inject(PokemonListLocalStore);

  // Only read loading/error from global store (UI state)
  loading = this.store.selectSignal(selectPokemonLoading);
  error = this.store.selectSignal(selectPokemonError);

  navigateToDetail(id: number): void {
    this.router.navigate(['/pokemon', id]);
  }

  onSearchChange(value: string): void {
    this.localStore.setSearchTerm(value);
  }
}
