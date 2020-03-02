
import { Component } from '@angular/core';

@Component({
  selector: 'ngx-d3',
  styleUrls: ['./d3.component.scss'],
  templateUrl: './d3.component.html',
})
export class D3Component {
 xAsset = 'Total Number of Competitors roll';
 yAsset= 'Earnings(S$)';
 xNet = 'Total Number of roll';
 yNet = 'Total Revenue/Cost'
  assets = [
    {
      name: '1',
      series: [
        {
          name: '0',
          value: -250,
        },
        {
          name: '10',
          value: -150,
        },
        {
          name: '20',
          value: -50,
        },
        {
          name: '30',
          value: 50,
        },
        {
          name: '40',
          value: 150,
        },
        {
          name: '50',
          value: 250,
        },
      ],
    },
    {
      name: '2',
      series: [
        {
          name: '0',
          value: -1000,
        },
        {
          name: '10',
          value: -600,
        },
        {
          name: '20',
          value: -200,
        },
        {
          name: '30',
          value: 200,
        },
        {
          name: '40',
          value: 600,
        },
        {
          name: '50',
          value: 1000,
        },
      ],
    },
   
  ];

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
