import { NgModule } from '@angular/core';

import { NbButtonModule, NbCardModule } from '@nebular/theme';
import { StaticchartComponent } from './staticchart.component';

@NgModule({
  imports: [
    NbButtonModule,
    NbCardModule,
  ],
  declarations: [
    StaticchartComponent
  ],
  providers: [],
})
export class StaticchartModule {
}
