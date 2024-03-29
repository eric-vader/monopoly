import { Component, OnDestroy, Input } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-d3-heatmap',
  template: `
    <ngx-charts-heat-map
      [scheme]="colorScheme"
      [results]="result"
      [legend]="legend"
      [showXAxisLabel]="showXAxisLabel"
      [showYAxisLabel]="showYAxisLabel"
      [xAxis]="xAxis"
      [yAxis]="yAxis"
      [xAxisLabel]="xAxisLabel"
      [yAxisLabel]="yAxisLabel"
      [view]="view"
      [trimYAxisTicks]="trimYAxisTicks"
      [trimXAxisTicks]="trimXAxisTicks"
      [legendTitle]="legendTitle">
    </ngx-charts-heat-map>
  `,
})
export class D3HeatmapComponent implements OnDestroy {
  @Input() result: any;
  @Input() view: any;
  @Input() colorScheme: any;
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;
  @Input() trimXAxisTicks: any;
  @Input() trimYAxisTicks: any;
  @Input() legendTitle: any;

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  

  // single = [
  //   {
  //     "name": "Germany",
  //     "series": [
  //       {
  //         "name": "2010",
  //         "value": 40632,
  //         "extra": {
  //           "code": "de"
  //         }
  //       },
  //       {
  //         "name": "2000",
  //         "value": 36953,
  //         "extra": {
  //           "code": "de"
  //         }
  //       },
  //       {
  //         "name": "1990",
  //         "value": 31476,
  //         "extra": {
  //           "code": "de"
  //         }
  //       }
  //     ]
  //   },
  
    
  // ];
  themeSubscription: any;

  constructor(private theme: NbThemeService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      this.colorScheme = 'aqua';
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
