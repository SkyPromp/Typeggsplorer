import { Component, ElementRef } from '@angular/core';
import { QuoteService } from '../quote-service/quote.service';
import { IQuote } from '../models/quote.model';
import * as d3 from 'd3';

@Component({
  selector: 'app-explorer',
  imports: [],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent {
  private quotes: IQuote[];
  private svg: any;
  private margin = { top: 40, right: -10, bottom: 40, left: 40 };
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
    this.ResetSvg();

    this.quoteService.Quotes$.subscribe(q =>
    {
      this.quotes = q;
      this.ResetSvg();
      this.drawScatterPlot(q.filter((quote: IQuote) => quote.ranked == this.is_ranked).map((quote: IQuote) => {return {x: quote.text.length, y: quote.difficulty, id: quote.quoteId, text: quote.text};}));
    });
  }

  public get Quotes(){
    return this.quotes;
  }

  private clearSvg(): void{
    d3.select(this.el.nativeElement).select('.scatterplot').select('svg').remove();
  }

  private ResetSvg(): void{
    this.clearSvg();
    this.createSvg();
    this.title = "Quote difficulty by length";
    this.xlabel = "Quote length (in characters)";
    this.ylabel = "Quote difficulty";
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

  private drawScatterPlot(data: {x: number, y: number, id: string, text: string}[]): void {
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


    this.svg.append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: any) => x_scale(d.x))
      .attr('cy', (d: any) => y_scale(d.y))
      .attr('r', 2)
      .attr('fill', 'steelblue')
      .attr('opacity', 0.8)
      .attr("data-status", "free")
      .on("mouseover", this.onMouseOver)
      .on("mouseout", this.onMouseOut)
      .on("click", this.onMouseClick);

  }

  private onMouseOver(event: MouseEvent, d: {x: number, y: number, id: string, text: string}){
    const tooltip = d3.select("#tooltip");

    const target = d3.select(event.currentTarget as SVGCircleElement);
    const color: string = target.attr("fill");

    d3.select(event.currentTarget as SVGCircleElement)
      .transition()
      .duration(100)
      .attr("r", 8)
      .attr("fill", target.attr("data-status") == "free"? "orange": color);

      tooltip.transition().duration(100).style("opacity", 1);
      tooltip.html(`<strong>Length:</strong> ${d.x}<br><strong>Difficulty:</strong> ${d.y}<br><strong>Quote Id:</strong> ${d.id}<br><strong>Text:</strong> ${d.text}`)
  }

  private onMouseOut(event: MouseEvent){
    const tooltip = d3.select("#tooltip");

    const target = d3.select(event.currentTarget as SVGCircleElement);
    const color: string = target.attr("fill");

    target
      .transition()
      .duration(200)
      .attr("r", 2)
      .attr("fill", target.attr("data-status") == "free"? "steelblue": color);

    tooltip.transition().duration(200).style("opacity", 0);
  }

  private onMouseClick(event: MouseEvent){
    d3.select(event.currentTarget as SVGCircleElement)
      .attr("fill", "red")
      .attr("data-status", "marked");
  }

  private set title(text: string){
    const fontsize = 24;

    this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .style("font-size", `${fontsize}px`)
        .attr("x", (this.width + text.length * fontsize / 2 + this.margin.right) / 2)
        .attr("y", -20)
        .text(text);
  }

  private set xlabel(text: string){
    const fontsize = 16;

    this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .style("font-size", `${fontsize}px`)
        .attr("x", this.width - 20)
        .attr("y", this.height + 35)
        .text(text);
  }

  private set ylabel(text: string){
    const fontsize = 16;

    this.svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -30)
      .attr("y", -40)
      .style("font-size", `${fontsize}px`)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text(text);
  }
}
