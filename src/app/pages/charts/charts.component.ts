import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NbThemeService } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/Rx';
import strategy_one from '../../../assets/data/strategy_1.json';
import strategy_two from '../../../assets/data/strategy_2.json';
import strategy_three from '../../../assets/data/strategy_3.json';
import strategy_four from '../../../assets/data/strategy_4.json';


import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'ngx-charts',
  styleUrls: ['./charts.component.scss'],
  templateUrl: './charts.component.html',
})
export class ChartsComponent {
  
  showData: boolean;
  strategyData: any;
  // static charts
  name = 'Set iframe source';
  url: string = "https://monopoly-nus.appspot.com/circular-monopoly.html";
  square_url: string = "https://monopoly-nus.appspot.com/yk/index.html";

  urlSafe: SafeResourceUrl;
  squareUrlSafe: SafeResourceUrl;

  // dynamic charts
  xTurn = 'Turns';
  yAsset = 'Total Earnings(S$)';
  yEarnings = 'Total Earnings(S$)';
  yExpenses = 'Total Expenses(S$)';
  yNet = 'Net Wealth(S$)';
  
  view: number[];
  assets: any;
  opponent: string;
  round: string;
  max_turn: number;
  assetsCol: any;
  stratCol: any;
  selectedStr: number[];
  ownStr: string;

  turnRatio: number;

  // simulation data
  simData: any;

  // Chart Data
  rankHeap: [];
  rankScheme: any;
  rankHeapView: any;
  rankHeapX: any;
  rankHeapY: any;
  rankHeapTitle: any;
  rankX: boolean;

  assetHeap: [];
  assetHeapView: any;
  assetScheme: any;
  assetHeapX: any;
  assetHeapY: any;
  assetHeapTitle: any;
  assetsEarning: [];
  earnings: [];
  expenses: [];
  net: [];

  strategy: any;
  playerName: any;
  downloadJsonHref: any;

  colorPlayer: string[];

  ops: number[];
  term: number;

  themeSubscription: any;

  assetTitle: any;
  playerTitle: any;

  constructor(private apiService: ApiService, private fb: FormBuilder,
    public sanitizer: DomSanitizer, private theme: NbThemeService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      this.rankScheme = 'aqua';
      this.assetScheme = 'solar';
    });

    // magic here
    this.term = 80;

    this.playerName = '';
    this.opponent = '';
    this.round = '';
    this.assets = [];
    this.view = [1400, 500];
    this.strategy = [];
    this.ownStr = '1';
    this.selectedStr = [];
    this.simData = [];
    this.apiService.getStrategy().subscribe(data => {
      this.strategy = data['strategies'].map(data => {
        return {
          name: data
        }
      });
      this.strategy.forEach((item, i) => {
        item.id = i + 1;
      });
    });
    this.colorPlayer = ['#8250C4', '#5ECBC8', '#438FF', '#FF977E', '#EB5757', '#5B2071',
        '#EC5A96', '#A43B76']
    this.assetHeapView = [1500, 1000];
    this.assetHeapY = "Property"
    this.assetHeapX = "Turns"
    this.rankHeapX = "Strategy"
    this.rankHeapY = "Rank"
    this.rankHeapView = [1500, 600];
    this.rankX = false;
    this.assetTitle = "Property"
    this.playerTitle = "Strategy"
    this.rankHeapTitle = "Frequency of Occurrence "
    this.assetHeapTitle = "Earnings(S$)"
    this.ops = [];
    this.strategyData = [strategy_one, strategy_two, strategy_three, strategy_four];
  }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.squareUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.square_url);
    this.apiService.getAssets('singapore').subscribe((data) => {
      this.assets = data['locations'];
      this.assetsCol = data['locations'].map((data) => {
        var color = data['Color'];
        if (typeof color === 'undefined') {
          color = '#00308F';
        }
        else if(color == "Light Blue") {
          color = '#ADD8E6'
        } else if (color == 'Brown (Dark Purple)') {
          color = '#A020F0';
        }
        return {
          "id": data['ID'],
          "name": data['Name'],
          "value": color,
          "color": data['Color'],
        }
      })
    });
  
  }

  set() {
    this.selectedStr = [];
    if(this.opponent) this.ops = Array(parseInt(this.opponent)).fill(0, 0, parseInt(this.opponent)).map((x, i) => i);
    
    console.log(this.ops)
  }

  simulate(): any {
 
    var temp = this.selectedStr.map(ele => {
      return this.strategy[ele-1]['name'];
    });

    this.apiService.runStrategy(temp,
      this.round, this.playerName, this.strategy[parseInt(this.ownStr)- 1]['name']).subscribe((data) => {
      this.simData = data;
      this.showData = true;
      this.populateCharts(this.simData);
    });

  }

  run(index: number) {
    if(this.showData == false) {
      this.showData = true;
      this.run(index);
    } else this.populateCharts(this.strategyData[index]);
  }

  populateCharts(data: any) {

    if(!data) return;
    // Ranking
    console.log(data)
    this.stratCol = this.strategy.map(data => {
      return {
        "name": data['name'],
        "value": this.getColor(data['name'])
      };
    })
    
    this.rankHeap = this.cleanRankHeap(data['simulation']['actors'], data['input_param']);

    this.assetHeap = this.cleanAssetHeap(data['simulation']['locations'], data['input_param']['max_turns']);

    // Assets Earning
    this.assetsEarning = this.caculateAssetsRevenue(data['simulation']['locations'], 'earnings');

    // Player Earnings
    this.earnings = this.calculateRevenue(data, 'earnings', data['input_param']);

    // Player Expense
    this.expenses = this.calculateRevenue(data, 'expenses', data['input_param']);

    this.net = this.calculateNet(this.earnings, this.expenses);

    this.calculateLocationProb(data['simulation']['locations']);

    this.createMoneyFlow(data['simulation']['stats'], data['input_param']);

  }

  calculateLocationProb(data: any): any {
    var p = 0;
    data.forEach(ele => {
      p = p + ele['p_landings']
    })
  }

  cleanRankHeap(data: any, basicInfo: any): any {
    var heapData = [];
    var series;
    
    Object.keys(data).map(player =>{
      var rank_hist = data[player]['ranking_hist']
      series = Object.keys(rank_hist).map(rank =>{
        return {
          name: rank,
          value: rank_hist[rank],
        };
      });
      
      heapData.push({
        name: parseInt(player) == 0 ? basicInfo['player_strategy']
          : basicInfo['opponents'][parseInt(player) - 1],
        series: series,
      });
    });
    return heapData;    
  }

  cleanAssetHeap(data: any, turn: number): any {
    var heapData = [];
    var series;
    var upper = turn/this.term;
    var revenue;
    var start;
    var end;
    var filterData = data.filter(ele => ele['earnings'])
    for (var m = 1; m <= upper; m++) {
      series = []; 
      if(m == upper) {
        start = upper * this.term + 1;
        end = turn;
      } else {
        start = (m - 1) * this.term + 1;
        end = start + this.term - 1;
      }
      series = filterData.map(asset => {
        revenue = 0;
        for (var i = start; i < end; i++) revenue = revenue + asset['earnings'][i];
        return {
          name: this.assets[asset['ID']]['Name'],
          value: revenue,
        }
      });
      heapData.push({
        name: "Turn: " + start + "-" + end,
        series: series,
      });
    }
    
    return heapData;  
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
    var filteredData = data.filter(ele => ele[type]);
    filteredData = this.culmulateEarnings(filteredData);

    return filteredData
      .map(d => {
        return {
          "name": this.assets[d['ID']]['Name'],
          "series": this.createSeries(d[type], -1),
        }
      });
  }

  culmulateEarnings(data: any): any {
    return data.map(asset=>{
      var temp = asset['earnings'];
      for (var i = 0; i < (temp.length-1); i++) {
        temp[i+1] = temp[i] + temp[i+1];
      }
      asset['earnings']=temp;
  
      return asset;
    })
  }

  calculateRevenue(data: any, type: string, basicInfo: any): any {
    // Player
    var players = data['simulation']['actors'];

    var revenue = Object.entries(players).map(actor => {
      var sum = [];
      var length = actor[1][type][0].length;
      for (let i = 0; i < length; i++) sum[i] = 0;

      actor[1][type].forEach(rev => {
        for (let i = 0; i < length; i++) sum[i] += parseInt(rev[i]);
      });
      
      for (let i = 1; i < length; i++) sum[i] = sum[i - 1] + sum[i];
     
      return {
        "name": parseInt(actor[0]) == 0 ? basicInfo['player_strategy']
          : basicInfo['opponents'][parseInt(actor[0]) - 1] ,
        "series": this.createSeries(sum, -1),
      }
    });
    return revenue;
  }

  calculateNet(earnings: any, expense: any): any {
    console.log(earnings)
    var netSeries;
    return earnings.map((player, i)=>{
      
      netSeries = player['series'].map((revenue, q)=>{
        return {
          name: q, 
          value: revenue['value']-expense[i]['series'][q]['value']
        };
      })
      return {
        name: player['name'],
        series: netSeries,
      }
    })
  }

  createMoneyFlow(data: any, basicInfo: any) {
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end
    let chart = am4core.create("chartdiv", am4charts.ChordDiagram);

    var colorNode = [];
    colorNode.push({
      from: "Player: " + basicInfo['player_strategy'],
      nodeColor: this.getColor(basicInfo['player_strategy']),
    });

    basicInfo['opponents'].forEach((op, i) => {
      var j = i+1;
      colorNode.push({
        from: 'Opponent' + j + ": " + op,
        nodeColor: this.getColor(op),
      })
    }) ;

    
    var flow = [];

    data['total_flow'].forEach((player, i) => {
      i = i;
      player.forEach((money, q) => {
        if(money > 0) {
          flow.push({
            from: i == 0 ? "Player: " + basicInfo['player_strategy']
              : 'Opponent' + i + ": " + basicInfo['opponents'][i-1],
            to: q == 0 ? "Player: " + basicInfo['player_strategy']
              : 'Opponent' + q + ": " + basicInfo['opponents'][q-1],
            value: parseInt(money), 
          })
        }
      });
    })


    var flowData = colorNode.concat(flow)

    chart.data = flowData;
    // [
    //     { from: "A", to: "D", value: 10 },
    //     { from: "B", to: "D", value: 8 },
    //     { from: "B", to: "E", value: 4 },
    //     { from: "B", to: "C", value: 2 },
    //     { from: "C", to: "E", value: 14 },
    //     { from: "E", to: "D", value: 8 },
    //     { from: "C", to: "A", value: 4 },
    //     { from: "G", to: "A", value: 7 },
    //     { from: "D", to: "B", value: 1 }
    // ];

    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    chart.dataFields.color = "nodeColor";

    // make nodes draggable
    let nodeTemplate = chart.nodes.template;
    nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
    nodeTemplate.showSystemTooltip = true;

    let nodeLink = chart.links.template;
    let bullet = nodeLink.bullets.push(new am4charts.CircleBullet());
    bullet.fillOpacity = 1;
    bullet.circle.radius = 5;
    bullet.locationX = 0.5;

    // create animations
    chart.events.on("ready", function() {
        for (var i = 0; i < chart.links.length; i++) {
            let link = chart.links.getIndex(i);
            let bullet = link.bullets.getIndex(0);

            animateBullet(bullet);
        }
    })

    function animateBullet(bullet) {
        let duration = 3000 * Math.random() + 2000;
        let animation = bullet.animate([{ property: "locationX", from: 0, to: 1 }], duration)
        animation.events.on("animationended", function(event) {
            animateBullet(event.target.object);
        })
    }
  }

  getColor(strategy: any): any {
    if(typeof strategy === "undefined") return;
    if (strategy == 'Random') return '#599495';
    else if (strategy == 'Recommended Strategy') return '#D7BAAA';
    else if (strategy.startsWith('Prefer')) {
      var color = strategy.replace('Prefer ', '');
      if (color == "Light Blue") {
        return '#ADD8E6'
      } else if (color == "Dark Blue") {
        return '#0000A0'
      } else if (color == 'Brown (Dark Purple)') {
        return  '#A020F0';
      } else if (color == 'Utility') {
        return '#20AAD6';
      } else if (color == 'Railroad') {
        return '#795A00';
      }
      else return color.toLowerCase();
    }
    else return '#FFFFFF';
  }
}
