import { Component, OnInit } from '@angular/core';
import { map, withLatestFrom } from 'rxjs/operators';
import { Hero, HeroService } from '../../services/hero.service';

@Component({
    selector: 'rx-hero-table',
    template: `
        <div class="tool-bar">
            <span class="search-tool">
                <label for="herosearch">Search: </label>
                <input
                    name="herosearch"
                    [value]="hero.searchBS | async"
                    (input)="setSearch($event.target.value)"
                />
            </span>
            <span class="page-tool">
                <label
                    >Page {{ userPage$ | async }} of
                    {{ hero.totalPages$ | async }} :
                </label>
                <span class="buttons">
                    <button
                        class="prev"
                        disabled="(userPage$ | async) === 1"
                        (click)="hero.pageBS.next(hero.pageBS.getValue() - 1)"
                    >
                        Prev
                    </button>
                    <button
                        class="next"
                        disabled="isLastPage$ | async"
                        (click)="hero.pageBS.next(hero.pageBS.getValue() + 1)"
                    >
                        Next
                    </button>
                </span>
            </span>
            <span class="result-tool">
                <label>Show Results: </label>
                <span
                    class="buttons"
                    *ngIf="hero.limitBS | async as currentLimit"
                >
                    <button
                        *ngFor="let limit of hero.limits"
                        [disabled]="limit === currentLimit"
                        (click)="setLimit(limit)"
                    >
                        {{ limit }}
                    </button>
                </span>
            </span>
            <span class="total-tool">
                <label>Total Results: {{ hero.totalHeroes$ | async }}</label>
            </span>
        </div>
        <div class="table-content" *ngIf="hero.heroes$ | async as heroes">
            <rx-hero-badge
                *ngFor="let hero of heroes"
                [hero]="hero"
            ></rx-hero-badge>
        </div>
    `,
    styleUrls: ['./hero-table.component.scss'],
})
export class HeroTableComponent {
    userPage$ = this.hero.pageBS.pipe(map(page => page + 1));
    isLastPage$ = this.hero.totalPages$.pipe(
        withLatestFrom(this.userPage$),
        map(([total, userPage]) => total === userPage),
    );

    constructor(public hero: HeroService) {}

    setLimit(limit: number) {
        this.hero.pageBS.next(0);
        this.hero.limitBS.next(limit);
    }

    setSearch(searchTerm: string) {
        this.hero.pageBS.next(0);
        this.hero.searchBS.next(searchTerm);
    }
}
