import { NgModule } from '@angular/core';

import { NbButtonModule } from '@nebular/theme';
import { StartPageComponent } from './start-page.component';
import { StartPageRoutingModule } from './start-page-routing.module';

@NgModule({
  imports: [
    StartPageRoutingModule,
    NbButtonModule,
  ],
  declarations: [
    StartPageComponent
  ],
  providers: [],
})
export class StartPageModule {
}
