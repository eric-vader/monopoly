import { NgModule } from '@angular/core';

import { NbButtonModule, NbCardModule, NbTabsetModule, } from '@nebular/theme';
import { StaticchartComponent } from './staticchart.component';

@NgModule({
  imports: [
    NbButtonModule,
    NbCardModule,
    NbTabsetModule,
  ],
  declarations: [
    StaticchartComponent
  ],
  providers: [],
})
export class StaticchartModule {
}
