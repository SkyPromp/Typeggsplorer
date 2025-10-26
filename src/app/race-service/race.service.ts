import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IRacesResponse, IRace } from '../models/race.model';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private races: BehaviorSubject<IRace[]>;
  private perPage: number;

  constructor(private http: HttpClient) {
    this.perPage = 1000;
    this.races = new BehaviorSubject<IRace[]>([]);
  }

  public fetchAllRaces(username: string): void{
    const baseURL: string = `https://api.typegg.io/v1/users/${username}/races?perPage=${this.perPage}&status=any`;

    this.http.get<IRacesResponse>(baseURL).subscribe(racesResponse =>
      {
        this.races.next(racesResponse.races);
        for (let page = racesResponse.page + 1; page <= racesResponse.totalPages; page++) {
          this.http.get<IRacesResponse>(`${baseURL}&page=${page}`).subscribe(r => this.races.next([...this.races.value, ...r.races]));
        }
      }
    );
  }

  public get Races$(): Observable<IRace[]> {
    return this.races.asObservable();
  }
}
