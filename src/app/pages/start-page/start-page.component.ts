import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-start-page',
  styleUrls: ['./start-page.component.scss'],
  templateUrl: './start-page.component.html',
})
export class StartPageComponent {
  constructor(private router: Router, private route: ActivatedRoute) {

  }
  start() {
    this.router.navigate(['charts'], { relativeTo: this.route });
  }
}