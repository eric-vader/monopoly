
import { Component } from '@angular/core';
import AssetsJson from '../../../../assets/data/assets.json';



@Component({
  selector: 'ngx-d3',
  styleUrls: ['./d3.component.scss'],
  templateUrl: './d3.component.html',
})
export class D3Component {
  xAsset = 'Total Number of Competitors roll';
  yAsset= 'Earnings(S$)';
  xNet = 'Total Number of roll';
  yNet = 'Total Revenue/Cost';
  assets: any;
  

  constructor(){
    console.log(this.assets);
    this.assets = [];
  }

  run(){
    console.log("hello");
    this.assets = AssetsJson;
    
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

  wealth = [
    {
      name: 'Player 1',
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
      name: 'Player 2',
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
    {
      name: 'Player 3',
      series: [
        {
          name: '0',
          value: 0,
        },
        {
          name: '5',
          value: 2,
        },
        {
          name: '10',
          value: 14,
        },
        {
          name: '15',
          value: 38,
        },
        {
          name: '20',
          value: 49,
        },
        {
          name: '25',
          value: 56,
        },
      ],
    },
    {
      name: 'Player 4',
      series: [
        {
          name: '0',
          value: 0,
        },
        {
          name: '5',
          value: 6,
        },
        {
          name: '10',
          value: 19,
        },
        {
          name: '15',
          value: 38,
        },
        {
          name: '20',
          value: 89,
        },
        {
          name: '25',
          value: 59,
        },
      ],
    },
  ];
}
