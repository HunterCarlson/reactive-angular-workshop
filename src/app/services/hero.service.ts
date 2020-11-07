import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    debounce,
    debounceTime,
    map,
    switchMap,
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

    searchBS = new BehaviorSubject('');
    pageBS = new BehaviorSubject(0);
    limitBS = new BehaviorSubject(LIMIT_LOW);

    params$ = combineLatest([this.searchBS, this.pageBS, this.limitBS]);

    heroesResponse$ = this.params$.pipe(
        debounceTime(500),
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
    );

    heroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.results));

    totalHeroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.total));

    totalPages$ = this.totalHeroes$.pipe(
        withLatestFrom(this.limitBS),
        map(([total, limit]) => Math.ceil(total / limit)),
    );

    constructor(private http: HttpClient) {}
}
