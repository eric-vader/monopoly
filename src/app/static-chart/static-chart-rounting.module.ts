import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CircularMonopolyComponent } from './circular-monopoly/circular-monopoly.component';

const routes: Routes = [{
  path: '',
  component: CircularMonopolyComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticMonopolyRoutingModule {
}
