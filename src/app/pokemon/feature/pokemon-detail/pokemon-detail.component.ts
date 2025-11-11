import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  PokemonActions,
  selectSelectedPokemon,
  selectPokemonLoading,
  selectPokemonError,
  selectIsPokemonFavorite,
} from '../../data-access';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PokemonInfoComponent } from '../../ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pokemon-detail',
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    PokemonInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <!-- Back Button -->
      <div class="mb-6">
        <p-button
          icon="pi pi-arrow-left"
          [label]="'Back to List'"
          severity="secondary"
          (onClick)="navigateBack()"
        />
      </div>

      <h1 class="text-4xl font-bold mb-6">Pokemon Details</h1>

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

      <!-- Pokemon Info -->
      @if (!loading() && !error() && pokemon()) {
        <app-pokemon-info
          [pokemon]="pokemon()"
          [isFavorite]="isFavorite()"
          (favoriteToggle)="toggleFavorite()"
        />
      }

      <!-- Not Found State -->
      @if (!loading() && !error() && !pokemon()) {
        <p-message severity="warn" text="Pokemon not found" />
      }
    </div>
  `,
})
export class PokemonDetailComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Get pokemonId from route params
  pokemonId = toSignal(
    this.route.params.pipe(map((params) => Number(params['id']))),
  );

  // Global state from NgRx Store
  pokemon = this.store.selectSignal(selectSelectedPokemon);
  loading = this.store.selectSignal(selectPokemonLoading);
  error = this.store.selectSignal(selectPokemonError);

  // Computed: Check if current pokemon is favorite
  isFavorite = computed(() => {
    const id = this.pokemonId();
    if (!id) return false;
    return this.store.selectSignal(selectIsPokemonFavorite(id))();
  });

  ngOnInit(): void {
    const id = this.pokemonId();
    if (id) {
      this.store.dispatch(PokemonActions.loadPokemonById({ id }));
    }
  }

  navigateBack(): void {
    this.router.navigate(['/pokemon']);
  }

  toggleFavorite(): void {
    const id = this.pokemonId();
    if (id) {
      this.store.dispatch(PokemonActions.toggleFavorite({ id }));
    }
  }
}
