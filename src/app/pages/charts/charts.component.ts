import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NbThemeService, NbColorHelper } from '@nebular/theme';

import 'rxjs/Rx';
import * as d3 from 'd3';
import strategyData from '../../../assets/data/strategy_1.json';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { create } from 'd3';


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
  max_turn: string;
  assetsCol: any;
  selectedStr: number[];
  ownStr: string;

  // Chart Data
  rankData: any;
  rankOp: any;
  rankHeap: [];
  assetsEarning: [];
  earnings: [];
  expenses: [];

  strategy: any;
  playerName: any;
  downloadJsonHref: any;

  colorPlayer: string[];

  ops: number[];

  constructor(private apiService: ApiService,
    public sanitizer: DomSanitizer) {
    this.playerName = 'Eric';
    this.opponent = '4';
    this.round = '10';
    this.max_turn = '500';
    this.assets = [];
    this.view = [1400, 500];
    this.strategy = [];
    this.ownStr = '1';
    this.selectedStr = [];
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
  }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.chordUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.chord_url);
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
          "name": data['Name'],
          "value": color
        }
      })
    });
  
  }

  set() {
    this.selectedStr = [];
    this.ops = Array(parseInt(this.opponent)).fill(0, 0, parseInt(this.opponent)).map((x, i) => i);
    console.log(this.ops)
  }

  simulate() {
    
    // this.apiService.simulate(this.opponent.toString(), this.round).subscribe((data) => {
    //   // Assets Earning
    //   this.assetsEarning = this.caculateAssetsRevenue(data['simulation']['locations'], 'earnings');

    //   // Player Earnings
    //   this.earnings = this.calculateRevenue(data, 'earnings');

    //   // Player Expense
    //   this.expenses = this.calculateRevenue(data, 'expenses');
     
    // });
    var temp = this.selectedStr.map(ele => {
      return this.strategy[ele-1]['name'];
    });
    this.apiService.runStrategy(temp,
      this.round, this.playerName, this.strategy[parseInt(this.ownStr)- 1]['name'],
       this.max_turn).subscribe((data) => {
      // // Assets Earning
      // this.assetsEarning = this.caculateAssetsRevenue(data['simulation']['locations'], 'earnings');

      // // Player Earnings
      // this.earnings = this.calculateRevenue(data, 'earnings');

      // // Player Expense
      // this.expenses = this.calculateRevenue(data, 'expenses');
      // var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8" + encodeURIComponent(JSON.stringify(data)));
      // this.downloadJsonHref = uri;
      var sJson = JSON.stringify(data);
      var element = document.createElement('a');
      element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
      element.setAttribute('download', "primer-server-task.json");
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click(); // simulate click
      document.body.removeChild(element);
      console.log(data);

      this.populateCharts(data);
    });

  }

  run() {
    this.populateCharts(strategyData);
  }

  populateCharts(data: any) {
    // Ranking
    console.log(data)
    this.rankData = this.cleanRank(data['simulation']['stats']['rankings']);
    this.rankOp =  {
      responsive: true,
      maintainAspectRatio: false,
      scaleFontColor: 'white',
      legend: {
        labels: {
          fontColor: 'black',
        },
      },
      scale: {
        pointLabels: {
          fontSize: 14,
        },
        gridLines: {
          color: 'lightgray',
        },
        angleLines: {
          color: 'lightgray',
        },
        ticks: {
          suggestedMin: 0,
          suggestedMax: parseInt(this.opponent) + 1,
          }
      },
    };
    
    this.rankHeap = this.cleanRankHeap(data['simulation']['stats']['rankings']);

    // Assets Earning
    this.assetsEarning = this.caculateAssetsRevenue(data['simulation']['locations'], 'earnings');

    // Player Earnings
    this.earnings = this.calculateRevenue(data, 'earnings');

    // Player Expense
    this.expenses = this.calculateRevenue(data, 'expenses');

    this.calculateLocationProb(data['simulation']['locations']);

    this.createMoneyFlow(data['simulation']['stats'], data['input_param'], 
        data['simulation']['actors']);

    // this.createRadarLocation();


  }

  calculateLocationProb(data: any): any {
    var p = 0;
    data.forEach(ele => {
      p = p + ele['p_landings']
    })

    console.log(p)
  }

  cleanRankHeap(data: any): any {
    var heapData = [];
    var series;
    for(var m=1; m<=(parseInt(this.opponent)+1);m++) {
      series = [];
      series = this.rankData['datasets'].map((ele, i)=>{
        return {
          name: i == 0 ? this.strategy[parseInt(this.ownStr) - 1]['name']
            : this.strategy[i - 1]['name'],
          value: this.occurrence(ele['data'])[m] ? this.occurrence(ele['data'])[m].length:0,
        }
      });
      heapData.push({
        name: "Rank " + m,
        series: series,
      });
    }
    return heapData;    
  }

  occurrence (data: any) {
    var result = {};
  
    data.forEach((v, i)=> {
      if (!result[v]) { 
        
        result[v] = [i]; 
      } else { 
        result[v].push(i);
      }
    });
  
    return result;
  };

  cleanRank(data: any): any {
    var labels = Array(parseInt(this.round)).fill(1, 0, parseInt(this.round)).map((x, i) => i);
    var conLabels = labels.map(ele => ele+1)
        .map(ele => "Turn " + ele)
    var dataset = this.createRankingSeries(data);
    return {
      'labels': conLabels,
      'datasets': dataset,
    }
  }

  createRankingSeries(data: any): any {
    var rankDataset = [];
    var rank = [];
    for(var i=0; i<=parseInt(this.opponent); i++) {
      rank = [];
      data.forEach(ele => {
        rank.push(ele.indexOf(i)+1);
      });
      rankDataset.push({
        data: rank,
        label: i == 0 ? this.playerName + ": " + this.strategy[parseInt(this.ownStr)-1]['name']
            : "Opponent" + i + ": " + this.strategy[i-1]['name'],
        borderColor: this.colorPlayer[i],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      //   
      })
    }
    return rankDataset;
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
    return data.filter(ele => ele[type])
      .filter(ele => {
        var sum = 0;
        ele[type].forEach(element => {
          sum += element;
        });
        return sum != 0;
      })
      .map(d => {
        return {
          "name": this.assets[d['ID']]['Name'],
          "series": this.createSeries(d[type], -1),
        }
      });
  }

  calculateRevenue(data: any, type: string): any {
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
        "name": actor[0],
        "series": this.createSeries(sum, -1),
      }
    });
    return revenue;
  }

  createMoneyFlow(data: any, basicInfo: any, name: any) {
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end
    let chart = am4core.create("chartdiv", am4charts.ChordDiagram);
    
    var key = basicInfo['player_name'];
    delete name[key];

    console.log(name)

    var opponentList = Object.keys(name);
    
    var flow = [];
    data['total_flow'].forEach((player, i) => {
      i = i;
      player.forEach((money, q) => {
        if(money > 0) {
          flow.push({
            from: i == 0 ? basicInfo['player_strategy']
              : basicInfo['opponents'][i-1],
            to: q == 0 ? basicInfo['player_strategy']
              : basicInfo['opponents'][q-1],
            value: parseInt(money), 
          })
        }
      });
    })

    console.log(flow)
    chart.data = flow;
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

  // createRadarLocation() {
  //   /* Chart code */
  //   // Themes begin
  //   am4core.useTheme(am4themes_animated);
  //   // Themes end

  //   /**
  //    * Chart design inspired by Nicolas Rapp: https://nicolasrapp.com/studio/
  //    */

  //   let chart = am4core.create("chartdiv2", am4charts.RadarChart);

  //   chart.data = [
  //     {
  //       name: "Openlane",
  //       value1: 560.2,
  //       value2: 126.9
  //     }
  //   ];


  //   chart.padding(0, 0, 0, 0);
  //   chart.radarContainer.dy = 50;
  //   chart.innerRadius = am4core.percent(50);
  //   chart.radius = am4core.percent(100);
  //   chart.zoomOutButton.padding(20,20,20,20);
  //   chart.zoomOutButton.margin(20,20,20,20);
  //   chart.zoomOutButton.background.cornerRadius(40,40,40,40);
  //   chart.zoomOutButton.valign = "bottom";

  //   let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis<am4charts.AxisRendererCircular>());
  //   categoryAxis.dataFields.category = "name";
  //   categoryAxis.renderer.labels.template.location = 0.5;
  //   // categoryAxis.mouseEnabled = false;

  //   let categoryAxisRenderer = categoryAxis.renderer;
  //   categoryAxisRenderer.cellStartLocation = 0;
  //   categoryAxisRenderer.tooltipLocation = 0.5;
  //   categoryAxisRenderer.grid.template.disabled = true;
  //   categoryAxisRenderer.ticks.template.disabled = true;

  //   categoryAxisRenderer.axisFills.template.fill = am4core.color("#e8e8e8");
  //   categoryAxisRenderer.axisFills.template.fillOpacity = 0.2;
  //   categoryAxisRenderer.axisFills.template.location = -0.5;
  //   categoryAxisRenderer.line.disabled = true;
  //   categoryAxisRenderer.tooltip.disabled = true;
  //   categoryAxis.renderer.labels.template.disabled = true;

  //   categoryAxis.adapter.add("maxZoomFactor", function(maxZoomFactor, target) {
  //     return target.dataItems.length / 5;
  //   })

  //   let valueAxis = chart.yAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererRadial>());

  //   let valueAxisRenderer = valueAxis.renderer;

  //   valueAxisRenderer.line.disabled = true;
  //   valueAxisRenderer.grid.template.disabled = true;
  //   valueAxisRenderer.ticks.template.disabled = true;
  //   valueAxis.min = 0;
  //   valueAxis.renderer.tooltip.disabled = true;

  //   let series1 = chart.series.push(new am4charts.RadarSeries());
  //   series1.name = "CASH HELD OUTSIDE THE U.S.";
  //   series1.dataFields.categoryX = "name";
  //   series1.dataFields.valueY = "value1";
  //   series1.stacked = true;
  //   series1.fillOpacity = 0.5;
  //   series1.fill = chart.colors.getIndex(0);
  //   series1.strokeOpacity = 0;
  //   series1.dataItems.template.locations.categoryX = 0.5;
  //   series1.sequencedInterpolation = true;
  //   series1.sequencedInterpolationDelay = 50;

  //   let series2 = chart.series.push(new am4charts.RadarSeries());
  //   series2.name = "TOTAL CASH PILE";
  //   series2.dataFields.categoryX = "name";
  //   series2.dataFields.valueY = "value2";
  //   series2.stacked = true;
  //   series2.fillOpacity = 0.5;
  //   series2.fill = chart.colors.getIndex(1);
  //   series2.stacked = true;
  //   series2.strokeOpacity = 0;
  //   series2.dataItems.template.locations.categoryX = 0.5;
  //   series2.sequencedInterpolation = true;
  //   series2.sequencedInterpolationDelay = 50;
  //   series2.tooltipText = "[bold]{categoryX}[/]\nTotal: ${valueY.total} \nOverseas: ${value1}";
  //   series2.tooltip.pointerOrientation = "vertical";
  //   series2.tooltip.label.fill = am4core.color("#ffffff");
  //   series2.tooltip.label.fontSize = "0.8em";
  //   series2.tooltip.autoTextColor = false;

  //   chart.seriesContainer.zIndex = -1;
  //   chart.scrollbarX = new am4core.Scrollbar();
  //   chart.scrollbarX.parent = chart.bottomAxesContainer;
  //   chart.scrollbarX.exportable = false;
  //   chart.scrollbarY = new am4core.Scrollbar();
  //   chart.scrollbarY.exportable = false;

  //   chart.padding(0, 0, 0, 0)

  //   chart.scrollbarY.padding(20, 0, 20, 0);
  //   chart.scrollbarX.padding(0, 20, 0, 80);

  //   chart.scrollbarY.background.padding(20, 0, 20, 0);
  //   chart.scrollbarX.background.padding(0, 20, 0, 80);

  //   chart.cursor = new am4charts.RadarCursor();
  //   chart.cursor.lineX.strokeOpacity = 1;
  //   chart.cursor.lineY.strokeOpacity = 0;
  //   chart.cursor.lineX.stroke = chart.colors.getIndex(1);
  //   chart.cursor.innerRadius = am4core.percent(30);
  //   chart.cursor.radius = am4core.percent(50);
  //   chart.cursor.selection.fill = chart.colors.getIndex(1);

  //   let bullet = series2.bullets.create();
  //   bullet.fill = am4core.color("#000000");
  //   bullet.strokeOpacity = 0;
  //   // bullet.locationX = 0.5;


  //   let line = bullet.parent.createChild(am4core.Line);
  //   line.x2 = -100;
  //   line.x1 = 0;
  //   line.y1 = 0;
  //   line.y1 = 0;
  //   line.strokeOpacity = 1;

  //   line.stroke = am4core.color("#000000");
  //   line.strokeDasharray = "2,3";
  //   line.strokeOpacity = 0.4;


  //   let bulletValueLabel = bullet.parent.createChild(am4core.Label);
  //   bulletValueLabel.text = "{valueY.total.formatNumber('$#.0')}";
  //   bulletValueLabel.verticalCenter = "middle";
  //   bulletValueLabel.horizontalCenter = "right";
  //   bulletValueLabel.dy = -3;

  //   let label = bullet.parent.createChild(am4core.Label);
  //   label.text = "{categoryX}";
  //   label.verticalCenter = "middle";
  //   label.paddingLeft = 20;

  //   valueAxis.calculateTotals = true;


  //   chart.legend = new am4charts.Legend();
  //   chart.legend.parent = chart.radarContainer;
  //   chart.legend.width = 110;
  //   chart.legend.horizontalCenter = "middle";
  //   chart.legend.markers.template.width = 22;
  //   chart.legend.markers.template.height = 18;
  //   chart.legend.markers.template.dy = 2;
  //   chart.legend.labels.template.fontSize = "0.7em";
  //   chart.legend.dy = 20;
  //   chart.legend.dx = -9;

  //   chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
  //   let itemHoverState = chart.legend.itemContainers.template.states.create("hover");
  //   itemHoverState.properties.dx = 5;

  //   let title = chart.radarContainer.createChild(am4core.Label);
  //   title.text = "COMPANIES WITH\nTHE MOST CASH\nHELD OVERSEAS"
  //   title.fontSize = "1.2em";
  //   title.verticalCenter = "bottom";
  //   title.textAlign = "middle";
  //   title.horizontalCenter = "middle";
  //   // title.fontWeigth = "800";

  //   chart.maskBullets = false;

  //   let circle = bullet.parent.createChild(am4core.Circle);
  //   circle.radius = 2;
  //   let hoverState = circle.states.create("hover");

  //   hoverState.properties.scale = 5;

  //   bullet.parent.events.on("positionchanged", function(event) {
  //       event.target.children.getIndex(0).invalidate();
  //       event.target.children.getIndex(1).invalidatePosition();
  //   })


  //   // bullet.adapter.add("dx", function(event) {
  //   //   let angle = categoryAxis.getAngle(event.dataItem, "categoryX", 0.5);
  //   //   return 20 * am4core.math.cos(angle);
  //   // })

  //   // bullet.adapter.add("dy", function(dy, target) {
  //   //   let angle = categoryAxis.getAngle(new am4charts.XYSeriesDataItem (target.dataItem), "categoryX", 0.5);
  //   //   return 20 * am4core.math.sin(angle);
  //   // })

  //   // bullet.adapter.add("rotation", function(dy, target) {
  //   //   let angle = Math.min(chart.endAngle, Math.max(chart.startAngle, categoryAxis.getAngle(target.dataItem, "categoryX", 0.5)));
  //   //   return angle;
  //   // })


  //   line.adapter.add("x2", function(x2, target) {
  //     let dataItem = target.dataItem;
  //     if (dataItem) {
  //       let position = valueAxis.valueToPosition(dataItem.values.valueY.value + dataItem.values.valueY.stack);
  //       return -(position * valueAxis.axisFullLength + 35);
  //     }
  //     return 0;
  //   })


  //   bulletValueLabel.adapter.add("dx", function(dx, target) {
  //     let dataItem = target.dataItem;

  //     if (dataItem) {
  //       let position = valueAxis.valueToPosition(dataItem.values.valueY.value + dataItem.values.valueY.stack);
  //       return -(position * valueAxis.axisFullLength + 40);
  //     }
  //     return 0;
  //   })


  //   chart.seriesContainer.zIndex = 10;
  //   categoryAxis.zIndex = 11;
  //   valueAxis.zIndex = 12;

  //   chart.radarContainer.zIndex = 20;


  //   let previousBullets = [];
  //   series2.events.on("tooltipshownat", function(event) {
  //     let dataItem = event.dataItem;

  //     for (let i = 0; i < previousBullets.length; i++) {
  //       previousBullets[i].isHover = false;
  //     }

  //     previousBullets = [];

  //     let itemBullet = dataItem.bullets.getKey(bullet.uid);

  //     // for (let i = 0; i < itemBullet.children.length; i++) {
  //     //   let sprite = itemBullet.children.getIndex(i);
  //     //   sprite.isHover = true;
  //     //   previousBullets.push(sprite);
  //     // }
  //   })

  //   series2.tooltip.events.on("visibilitychanged", function() {
  //     if (!series2.tooltip.visible) {
  //       for (let i = 0; i < previousBullets.length; i++) {
  //         previousBullets[i].isHover = false;
  //       }
  //     }
  //   })

  //   chart.events.on("maxsizechanged", function() {
  //     if(chart.pixelInnerRadius < 200){
  //       title.disabled = true;
  //       chart.legend.verticalCenter = "middle";
  //       chart.legend.dy = 0;
  //     }
  //     else{
  //       title.disabled = false;
  //       chart.legend.verticalCenter = "top";
  //       chart.legend.dy = 20;
  //     }
  //   })

  // }
}
