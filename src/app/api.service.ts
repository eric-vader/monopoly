import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private httpClient: HttpClient) {}
  
  API_KEY = '';
  SIM_URL = 'https://monopoly-nus.appspot.com/api/dynamic';
  ASSET_URL = 'https://monopoly-nus.appspot.com/api/locations/singapore';


  public simulate(opponent: string, round: string) {
    let body = new HttpParams();
    body = body.set('n_opponents', opponent);
    body = body.set('n_rounds', round);
    body = body.set('country', "singapore");
    return this.httpClient.post(this.SIM_URL, body);
  }

  public getAssets() {
    return this.httpClient.get(this.ASSET_URL);
  }
}