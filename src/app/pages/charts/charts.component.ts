import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import AssetsJson from '../../../assets/data/assets.json';
import { NumberCardComponent } from '@swimlane/ngx-charts';

@Component({
  selector: 'ngx-charts',
  templateUrl: './charts.component.html',
})
export class ChartsComponent {
  xTurn = 'Total Number of Turns';
  yAsset = 'Earnings(S$)';
  yEarnings = 'Total Earnings';
  yExpenses = 'Total Expenses';

  assets: any;
  opponent: string;
  round: string;

  // Chart Data
  earnings: [];
  expenses: [];

  constructor(private apiService: ApiService) {
    this.opponent = '4';
    this.round = '34';
    this.assets = [];
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
    return data.map(d => {
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

  multi = [
    {
      name: 'Total Revenue',
      series: [
        {
          name: '0',
          value: 0,
        },
        {
          name: '5',
          value: 10,
        },
        {
          name: '10',
          value: 20,
        },
        {
          name: '15',
          value: 40,
        },
        {
          name: '20',
          value: 50,
        },
        {
          name: '25',
          value: 80,
        },
      ],
    },
    {
      name: 'Total Cost',
      series: [
        {
          name: '0',
          value: 0,
        },
        {
          name: '5',
          value: 3,
        },
        {
          name: '10',
          value: 15,
        },
        {
          name: '15',
          value: 34,
        },
        {
          name: '20',
          value: 44,
        },
        {
          name: '25',
          value: 59,
        },
      ],
    },
  ];


}
