import { Component } from '@angular/core';
import { QuoteService } from '../quote-service/quote.service';
import { IQuote } from '../models/quote.model';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private quotes: IQuote[];

  constructor(
    private quoteService: QuoteService
  ){
    this.quotes = [];
  }

  ngOnInit(){
    this.quoteService.Quotes$.subscribe(q => this.quotes = q);
  }

  public get Quotes(){
    return this.quotes;
  }
}
