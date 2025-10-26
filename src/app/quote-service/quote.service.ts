import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IQuote, IQuotesResponse } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private quotes: BehaviorSubject<IQuote[]>;
  private perPage: number;

  constructor(private http: HttpClient) {
    this.perPage = 1000;
    this.quotes = new BehaviorSubject<IQuote[]>([]);
    this.fetchAllQuotes();
  }

  public fetchAllQuotes(): void{
    const baseURL: string = `https://api.typegg.io/v1/quotes?perPage=${this.perPage}&status=any`;

    this.http.get<IQuotesResponse>(baseURL).subscribe(quotesResponse =>
      {
        this.quotes.next(quotesResponse.quotes);
        for (let page = quotesResponse.page + 1; page <= quotesResponse.totalPages; page++) {
          this.http.get<IQuotesResponse>(`${baseURL}&page=${page}`).subscribe(r => this.quotes.next([...this.quotes.value, ...r.quotes]));
        }
      }
    );
  }

  public get Quotes$(): Observable<IQuote[]> {
    return this.quotes.asObservable();
  }
}
