import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ngx-charts',
  styleUrls: ['./charts.component.scss'],
  templateUrl: './charts.component.html',
})
export class ChartsComponent {
  // static charts
  name = 'Set iframe source';
  url: string = "https://monopoly-nus.appspot.com/circular-monopoly.html";
  chord_url: string ="https://monopoly-nus.appspot.com/chord.html";
  square_url: string = "https://monopoly-nus.appspot.com/yk/index.html";

  urlSafe: SafeResourceUrl;
  chordUrlSafe: SafeResourceUrl;
  squareUrlSafe: SafeResourceUrl;

  // dynamic charts
  xTurn = 'Total Number of Turns';
  yAsset = 'Earnings(S$)';
  yEarnings = 'Total Earnings';
  yExpenses = 'Total Expenses';
  
  view: number[];
  assets: any;
  opponent: string;
  round: string;

  // Chart Data
  earnings: [];
  expenses: [];

  constructor(private apiService: ApiService,
    public sanitizer: DomSanitizer) {
    this.opponent = '4';
    this.round = '34';
    this.assets = [];
    this.view = [1400, 500];
  }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.chordUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.chord_url);
    this.squareUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.square_url);
  
  }

  run() {
    //this.assets = AssetsJson;
    this.apiService.simulate(this.opponent, this.round).subscribe((data) => {
      console.log(data)
      
      // Assets Earning
      this.assets = this.caculateAssetsRevenue(data['simulation']['locations'], 'earnings');

      // Player Earnings
      this.earnings = this.calculateRevenue(data, 'earnings');

      // Player Expense
      this.expenses = this.calculateRevenue(data, 'expenses');

     
      //this.assets = data[];
    });
    // this.apiService.getData().subscribe((data)=>{
    //   console.log(data);
    //   //this.assets = data[];
    // })

    

  }

  createSeries(data: any, iterator: number): any {
    return data.map(ele => {
      iterator++;
      return {
        "name": iterator.toString(),
        "value": ele,
      }
    });
  }

  caculateAssetsRevenue(data: any, type: string): any {
    return data.filter(ele => {
      var sum = 0;
      ele[type].forEach(element => {
        sum += element;
      });
      return sum != 0;
    })
      .map(d => {
        return {
          "name": d['ID'],
          "series": this.createSeries(d[type], -1),
        }
      });
  }

  calculateRevenue(data: any, type: string): any {
    // Player
    var players = data['simulation']['actors'];
    console.log(Object.entries(players))

    var revenue = Object.entries(players).map(actor => {
      var sum = [];
      var length = actor[1][type][0].length;
      for (let i = 0; i < length; i++) sum[i] = 0;

      actor[1][type].forEach(rev => {
        for (let i = 0; i < length; i++) sum[i] += parseInt(rev[i]);
      });
      console.log(sum);
      
      for (let i = 1; i < length; i++) sum[i] = sum[i - 1] + sum[i];
      
      return {
        "name": actor[0],
        "series": this.createSeries(sum, -1),
      }
    });
    return revenue;
  }
}
