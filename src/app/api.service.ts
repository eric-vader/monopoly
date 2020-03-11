import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private httpClient: HttpClient) {}
  
  API_KEY = '';
  API_URL = 'https://20200311t102733-dot-monopoly-nus.appspot.com/api/basic/probabilities';
  
  public getData() {
    return this.httpClient.get(this.API_URL);
  }
}