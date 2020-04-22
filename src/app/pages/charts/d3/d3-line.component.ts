
import { Component, OnDestroy, Input } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-d3-line',
  template: `
    <ngx-charts-line-chart
      [scheme]="colorScheme"
      [results]="results"
      [xAxis]="showXAxis"
      [yAxis]="showYAxis"
      [legend]="showLegend"
      [legendTitle]="legendTitle"
      [showXAxisLabel]="showXAxisLabel"
      [showYAxisLabel]="showYAxisLabel"
      [xAxisLabel]="xAxisLabel"
      [yAxisLabel]="yAxisLabel"
      [view]="view"
      [customColors]="customCol">
    </ngx-charts-line-chart>
  `,
})
export class D3LineComponent implements OnDestroy {
  @Input() results;
  @Input() xAxisLabel: String;
  @Input() yAxisLabel: String;
  @Input() view: number[];
  @Input() scheme: any;
  @Input() customCol: any;
  @Input() legendTitle: any;

  
  showLegend = true;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  colorScheme: any;
  themeSubscription: any;

  constructor(private theme: NbThemeService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      this.colorScheme = {
        domain: [colors.successLight, colors.dangerLight, colors.warningLight, colors.infoLight, colors.primaryLight],
      };
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
