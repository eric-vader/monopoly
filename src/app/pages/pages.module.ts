import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { NbMenuModule } from '@nebular/theme';
import { ChartsModule } from './charts/charts.module';

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    ChartsModule,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [ ],
})
export class PagesModule {
}
