import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
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
                    (input)="hero.searchBS.next($event.target.value)"
                />
            </span>
            <span class="page-tool">
                <label
                    >Page {{ userPage$ | async }} of
                    {{ hero.totalPages$ | async }} :
                </label>
                <span class="buttons">
                    <button class="prev">Prev</button>
                    <button class="next">Next</button>
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
                        (click)="hero.limitBS.next(limit)"
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
export class HeroTableComponent implements OnInit {
    userPage$ = this.hero.pageBS.pipe(map(page => page + 1));

    constructor(public hero: HeroService) {}

    ngOnInit() {}
}
