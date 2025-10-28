import { Component, ElementRef } from '@angular/core';
import { FormsModule, ValueChangeEvent } from '@angular/forms';
import { QuoteService } from '../quote-service/quote.service';
import { IQuote } from '../models/quote.model';
import * as d3 from 'd3';
import { RaceService } from '../race-service/race.service';
import { IRace } from '../models/race.model';

@Component({
  selector: 'app-explorer',
  imports: [FormsModule],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent {
  private quotes: IQuote[];
  private raceIds: Set<string>;
  private svg: any;
  private margin = { top: 40, right: -10, bottom: 40, left: 40 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  public ranked_filter: string = "ranked";
  public user_filter: string = "all";
  public masochist_filter: string = "all";
  public masochistIds: Set<string>;

  constructor(
    private quoteService: QuoteService,
    private raceService: RaceService,
    private el: ElementRef
  ){
    this.quotes = [];
    this.raceIds = new Set();
    this.masochistIds = new Set();
    this.loadMasochistIds();
  }

  ngOnInit(){
    this.ResetSvg();

    this.quoteService.Quotes$.subscribe(q =>
    {
      this.quotes = q;
      this.refreshData();
    });

    this.raceService.Races$.subscribe(r =>
    {
      this.raceIds = new Set(r.map(race => race.quoteId));
      this.refreshData();
    });
  }

  public requestUserData(event: Event): void{
    this.raceService.fetchAllRaces((event.target as HTMLInputElement).value);
  }

  public refreshData(): void{
    console.log(`rerender graph: ${this.ranked_filter}`);
    console.log(this.raceIds);

    this.ResetSvg();
    this.drawScatterPlot(this.quotes
      .filter((quote: IQuote) =>
        ((this.ranked_filter == "ranked") && quote.ranked) ||
        (this.ranked_filter == "unranked") && (!quote.ranked) ||
        (this.ranked_filter != "ranked" && this.ranked_filter != "unranked")
      )
      .filter((quote: IQuote) =>
        ((this.user_filter == "played") && this.raceIds.has(quote.quoteId)) ||
        (this.user_filter == "unplayed") && !this.raceIds.has(quote.quoteId) ||
        (this.user_filter != "played" && this.user_filter != "unplayed")
      )
      .filter((quote: IQuote) =>
        ((this.masochist_filter == "show") && this.masochistIds.has(quote.quoteId)) ||
        (this.masochist_filter == "hide") && !this.masochistIds.has(quote.quoteId) ||
        (this.masochist_filter != "show" && this.masochist_filter != "hide")
      )
      .map((quote: IQuote) => {return {x: quote.text.length, y: quote.difficulty, id: quote.quoteId, text: quote.text};}));
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
      .on("click", this.onMouseClick)
      .on("contextmenu", this.onRightClick);
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

      d3.select("#tt_length").text(d.x);
      d3.select("#tt_difficulty").text(d.y);
      d3.select("#tt_id").text(d.id);
      d3.select("#tt_text").text(d.text);
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
    const target = d3.select(event.currentTarget as SVGCircleElement);

    d3.select(event.currentTarget as SVGCircleElement)
      .attr("fill", target.attr("data-status") == "marked"? "steelblue": "red")
      .attr("data-status", target.attr("data-status") == "marked"? "free": "marked");
  }

  private onRightClick(event: MouseEvent, d: {x: number, y: number, id: string, text: string}){
    event.preventDefault();

    window.open(`https://www.typegg.io/solo/${d.id}`);
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

  private loadMasochistIds(){
  this.masochistIds = new Set(
      ["'tnight_6190", "fiofyww_3003", "oasanaa_8555", "tuchotc_8080", "tn_1141 ", "agaacad_6131 ", "c2sca&g_4101 ", "%22itmsr%22_4378 ", "%7C__%7C_%7C%7C_0969", "56528;;_2005", "ltbkoaj_8262", "tipdiac_0197", "fcapasp_3101", "l_2740", "tcwctrt_1633", "d=pv-uv_2129", "rbyogyo_1135", "a-aaa-a_7900", "itssddy_1646", "'hghghh_3155", "fiitfcc_8185", "-gcbv3g_3655", "ddddddd_0044", "cdrea-a_7235", "aiottpi_8417", "toniea__4834", "psa12zj_8889", "%22coahby_6569", "lobfnfl_9914", "cicbdit_0404", "tsoaafo_1609", "tasmojt_8685", "%22itmsr%22_9511", "paasoac_6945", "hfiiacw_5103", "ttotkfb_7833", "tf(oaow_5127", "lylahhw_3157", "thorsbc_2466", "'apipuo_5748", "a5mjdpa_6632", "noog!gg_3476", "(c=c+c2_3379", "wtngamn_7486", "vivahvv_4965", "potumcf_3047", "1btssov_5424", "nttgewo_5373", "atcpwtv_4784", "dmem(mf_6934", "tvareot_4971", "eyvgtqy_2644", "3ttaa1p_1517", "ycnqptb_9823", "tfgostc_0544", "bi2jyod_5871", "tptwgfa_4935", "atwmots_9726", "(+(+(+(_8548", "hptqmme_4489", "cptptpa_6337", "atcmcbo_7232", "14(weap_6404", "tuawpoa_7911", "oipbnot_2900", "enifnim_7344", "k=s+s+s_8285", "fkkit3s_9160", "n91gbbe_6825", "hdysdwt_4310", "tscysui_4765", "tijgnjl_6472", "whszozm_7325", "ew(%7Bcnu_2238", "twhotaa_9101", "utmbsaf_2616", "%22wt%22nmj_9236", "tmmbiss_9299", "ticctwa_7803", "1[amo2d_0959", "thpafap_6071", "ipeb[hh_4088", "oids1gl_8078", "tskbmmg_9408", "31lgton_0939", "vsssbtt_2313", "iwapttt_2522", "tfwqtma_7265", "aatsots_0224", "wmdaiws_7610", "%22p1xkhi_8539", "11poino_0310", "tsaltia_0405", "hyhoohd_7757", "tfeeomf_1374", "%22usnyhd_0388", "dueufee_5636"]
    );
  }
}
