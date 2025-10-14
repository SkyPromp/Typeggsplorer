import { Component, ElementRef } from '@angular/core';
import { QuoteService } from '../quote-service/quote.service';
import { IQuote } from '../models/quote.model';
import * as d3 from 'd3';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent{
  private quotes: IQuote[];
  private svg: any;
  private margin = { top: -10, right: -10, bottom: 20, left: 20 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  public is_ranked;

  constructor(
    private quoteService: QuoteService,
    private el: ElementRef
  ){
    this.quotes = [];
    this.is_ranked = true;
  }

  ngOnInit(){
    this.createSvg();

    this.quoteService.Quotes$.subscribe(q =>
    {
      this.quotes = q;
      this.drawScatterPlot(q.filter((quote: IQuote) => quote.ranked == this.is_ranked).map((quote: IQuote) => {return {x: quote.text.length, y: quote.difficulty};}));
    });
  }

  public get Quotes(){
    return this.quotes;
  }

  private createSvg(): void {
    this.svg = d3.select(this.el.nativeElement)
      .select('.scatterplot')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private drawScatterPlot(data: {x: number, y: number}[]): void {
    const x_scale = d3.scaleLinear()
      .domain([0, Math.max(...data.map((point) => point.x)) + 500])
      .range([0, this.width]);

    const y_scale = d3.scaleLinear()
      .domain([0, Math.max(...data.map((point) => point.y)) + 1])
      .range([this.height, 0]);

    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x_scale));

    this.svg.append('g')
      .call(d3.axisLeft(y_scale));

    const tooltip = d3.select("#tooltip");

    this.svg.append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: any) => x_scale(d.x))
      .attr('cy', (d: any) => y_scale(d.y))
      .attr('r', 2)
      .attr('fill', 'steelblue')
      .attr('opacity', 0.8)

      .on("mouseover", function (event: MouseEvent, d: {x: number, y: number}) {
        d3.select(event.currentTarget as SVGCircleElement)
          .transition()
          .duration(100)
          .attr("r", 8)
          .attr("fill", "orange");

      tooltip.transition().duration(100).style("opacity", 1);
      tooltip
        .html(`<strong>Length:</strong> ${d.x}<br><strong>Difficulty:</strong> ${d.y}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })

    .on("mouseout", function (event: MouseEvent, d: {x: number, y: number}) {
        d3.select(event.currentTarget as SVGCircleElement)
        .transition()
        .duration(200)
        .attr("r", 2)
        .attr("fill", "steelblue");

      // Hide tooltip
      tooltip.transition().duration(200).style("opacity", 0);
    });
  }
}
