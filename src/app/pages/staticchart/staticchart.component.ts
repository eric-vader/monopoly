import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ngx-staticchart-page',
  styleUrls: ['./staticchart.component.scss'],
  templateUrl: './staticchart.component.html',
})
export class StaticchartComponent {
  name = 'Set iframe source';
  url: string = "https://monopoly-nus.appspot.com/anand/circular-monopoly.html";
  square_url: string = "https://monopoly-nus.appspot.com/yk/index.html";

  urlSafe: SafeResourceUrl;
  chordUrlSafe: SafeResourceUrl;
  squareUrlSafe: SafeResourceUrl;
  
  constructor(private router: Router, private route: ActivatedRoute,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.squareUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.square_url);
  }

  start() {
    this.router.navigate(['pages'], { relativeTo: this.route });
  }
}