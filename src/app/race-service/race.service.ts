import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IRacesResponse, IRace } from '../models/race.model';
import { ILoadingProgress } from '../models/loading-progress.model';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private races: BehaviorSubject<IRace[]>;
  private perPage: number;
  private racesLoaded: BehaviorSubject<ILoadingProgress>;

  constructor(private http: HttpClient) {
    this.perPage = 1000;
    this.races = new BehaviorSubject<IRace[]>([]);
    this.racesLoaded = new BehaviorSubject<ILoadingProgress>({loaded: 0, toLoad: undefined} as ILoadingProgress);
  }

  public fetchAllRaces(username: string | null | undefined): void{
    if (username == null || username == undefined) return;

    username = username.trim();

    if (username === "") return;

    this.racesLoaded.next({loaded: 0, toLoad: undefined} as ILoadingProgress)
    this.races.next([]);

    const baseURL: string = `https://api.typegg.io/v1/users/${username}/races?perPage=${this.perPage}&status=any`;

    this.http.get<IRacesResponse>(baseURL).subscribe(racesResponse =>
      {
        this.races.next(racesResponse.races);
        this.racesLoaded.next({loaded: 1, toLoad: racesResponse.totalPages} as ILoadingProgress)
        for (let page = racesResponse.page + 1; page <= racesResponse.totalPages; page++) {
          this.http.get<IRacesResponse>(`${baseURL}&page=${page}`).subscribe(r => this.races.next([...this.races.value, ...r.races]));
          this.racesLoaded.next({loaded: this.racesLoaded.value ? this.racesLoaded.value.loaded + 1: 1, toLoad: racesResponse.totalPages} as ILoadingProgress)
        }
      }
    );
  }

  public get Races$(): Observable<IRace[]> {
    return this.races.asObservable();
  }

  public get LoadingProgress$(): Observable<ILoadingProgress> {
    return this.racesLoaded.asObservable();
  }
}
