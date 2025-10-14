import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
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

  public fetchAllQuotes(){ // TODO: get all quotes instead of only the first page
    this.http.get<IQuotesResponse>(`https://api.typegg.io/v1/quotes?perPage=${this.perPage}&status=any`).subscribe(quotesResponse => this.quotes.next(quotesResponse.quotes));
  }

  public get Quotes$() {
    return this.quotes.asObservable();
  }
}
