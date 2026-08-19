import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IQuote, IQuotesResponse } from '../models/quote.model';
import { ILoadingProgress } from '../models/loading-progress.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private quotes: BehaviorSubject<IQuote[]>;
  private quotesLoaded: BehaviorSubject<ILoadingProgress>;
  private perPage: number;

  constructor(private http: HttpClient) {
    this.perPage = 1000;
    this.quotes = new BehaviorSubject<IQuote[]>([]);
    this.quotesLoaded = new BehaviorSubject<ILoadingProgress>({loaded: 0, toLoad: undefined} as ILoadingProgress);
    this.fetchAllQuotes();
  }

  public fetchAllQuotes(): void{
    const baseURL: string = `https://api.typegg.io/v1/quotes?perPage=${this.perPage}&status=any`;
    this.quotesLoaded.next({loaded: 0, toLoad: undefined} as ILoadingProgress)
    this.quotes.next([]);

    this.http.get<IQuotesResponse>(baseURL).subscribe(quotesResponse =>
      {
        this.quotes.next(quotesResponse.quotes);
        this.quotesLoaded.next({loaded: 1, toLoad: quotesResponse.totalPages} as ILoadingProgress)

        for (let page = quotesResponse.page + 1; page <= quotesResponse.totalPages; page++) {
          this.http.get<IQuotesResponse>(`${baseURL}&page=${page}`).subscribe(r => {
          this.quotes.next([...this.quotes.value, ...r.quotes]);
          this.quotesLoaded.next({loaded: this.quotesLoaded.value ? this.quotesLoaded.value.loaded + 1: 1, toLoad: quotesResponse.totalPages} as ILoadingProgress)
          });
        }
      }
    );
  }

  public get Quotes$(): Observable<IQuote[]> {
    return this.quotes.asObservable();
  }

  public get LoadingProgress$(): Observable<ILoadingProgress> {
    return this.quotesLoaded.asObservable();
  }
}
