import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private httpClient: HttpClient) {}
  
  API_KEY = '';
  SIM_URL = 'https://monopoly-nus.appspot.com/api/dynamic';
  ASSET_URL = 'https://monopoly-nus.appspot.com/api/locations';
  STRATEGY_KEY = 'strategy';


  public simulate(opponent: string, round: string) {
    let body = new HttpParams();
    body = body.set('n_opponents', opponent);
    body = body.set('n_rounds', round);
    body = body.set('country', "singapore");
    return this.httpClient.post(this.SIM_URL, body);
  }

  public getAssets(location: string) {
    return this.httpClient.get(`${this.ASSET_URL}/${location}`);
  }

  public getStrategy() {
    return this.httpClient.get(`${this.SIM_URL}/${this.STRATEGY_KEY}`);
  }

  public runStrategy(opponents: string[], rounds: string, player: string, player_str: string, turn: string){
    let body = new HttpParams();
    body = body.set('opponents', opponents.toString());
    body = body.set('player_name', player);
    body = body.set('player_strategy', player_str);
    body = body.set('max_turns', turn);
    body = body.set('n_rounds', rounds);
    body = body.set('country', "singapore");
    body = body.set('random_seed', '0');
    return this.httpClient.post(this.SIM_URL, body);
  }
}