import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    debounce,
    debounceTime,
    distinctUntilChanged,
    map,
    shareReplay,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Hero {
    id: number;
    name: string;
    description: string;
    thumbnail: HeroThumbnail;
    resourceURI: string;
    comics: HeroSubItems;
    events: HeroSubItems;
    series: HeroSubItems;
    stories: HeroSubItems;
}

export interface HeroThumbnail {
    path: string;
    extendion: string;
}

export interface HeroSubItems {
    available: number;
    returned: number;
    collectionURI: string;
    items: HeroSubItem[];
}

export interface HeroSubItem {
    resourceURI: string;
    name: string;
}

// The URL to the Marvel API
const HERO_API = `${environment.MARVEL_API.URL}/v1/public/characters`;

// Our Limits for Search
const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];

@Injectable({
    providedIn: 'root',
})
export class HeroService {
    limits = LIMITS;

    private searchBS = new BehaviorSubject('');
    private pageBS = new BehaviorSubject(0);
    private limitBS = new BehaviorSubject(LIMIT_LOW);
    private loadingBS = new BehaviorSubject(false);

    search$ = this.searchBS.asObservable().pipe(distinctUntilChanged());
    page$ = this.pageBS.asObservable().pipe(distinctUntilChanged());
    limit$ = this.limitBS.asObservable().pipe(distinctUntilChanged());
    loading$ = this.loadingBS.asObservable().pipe(distinctUntilChanged());

    params$ = combineLatest([this.search$, this.page$, this.limit$]);

    heroesResponse$ = this.params$.pipe(
        debounceTime(500),
        tap(() => this.loadingBS.next(true)),
        switchMap(([search, page, limit]) => {
            const params: any = {
                apikey: environment.MARVEL_API.PUBLIC_KEY,
                limit: `${limit}`,
                offset: `${page * limit}`,
            };
            if (search) {
                params.nameStartsWith = search;
            }
            return this.http.get(HERO_API, {
                params: params,
            });
        }),
        tap(() => this.loadingBS.next(false)),
        shareReplay(1),
    );

    heroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.results));

    totalHeroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.total));

    totalPages$ = this.totalHeroes$.pipe(
        withLatestFrom(this.limit$),
        map(([total, limit]) => Math.ceil(total / limit)),
    );

    constructor(private http: HttpClient) {}

    movePageBy(moveBy: number) {
        const newPage = this.pageBS.getValue() + moveBy;
        this.pageBS.next(newPage);
    }

    setLimit(limit: number) {
        this.pageBS.next(0);
        this.limitBS.next(limit);
    }

    setSearch(search: string) {
        this.pageBS.next(0);
        this.searchBS.next(search);
    }
}
