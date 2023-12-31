import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
var crypto = require('crypto-browserify');
var httpBuildQuery = require('http-build-query');
var uniqid = require('locutus/php/misc/uniqid');
var MD5 = require('locutus/php/strings/md5');
var mt_rand = require('locutus/php/math/mt_rand');
var php_array = require('locutus/php/array');

// game api srevice
@Injectable({
  providedIn: 'root',
})
// the class that contains the methods for interacting with the slotegrator api, its now called apigrator
export class GameapiService {
  // whatgame headers can be there
  gameHeaders: any;
  // get the staging url
  stageURL = environment.game_stage_url;
  // what can be the game url
  gameUrl: any;
  // get the config object
  list = {
    freespin_valid_until_full_day: 0,
    has_freespins: 0,
    has_lobby: 1,
    has_tables: 0,
    image:
      'https://staging.slotegrator.com/api/index.php/image/get?hash=e88a563aed2cc6ddbfc263587def1d6d0e0eb145.png',
    is_mobile: 1,
    name: 'Roulette',
    provider: 'Vivogaming',
    technology: 'HTML5',
    type: 'roulette',
    uuid: 'e88a563aed2cc6ddbfc263587def1d6d0e0eb145',
  };
  defaultHeaderObj: any;
  private BASE_URL = environment.base_url;
  constructor(private http: HttpClient, private router: Router) {}

   getAllGames() {
    const authObj: object = {
      page: 2,
    };
    this.gameHeaders = this.xSignGenerate(authObj);
    // const response = fetch(`${this.stageURL}/games?page=2`, {
    //   method: 'get',
    //   headers: this.gameHeaders,
    // });
    // console.log(response);
    let response =  this.http.get(`${this.stageURL}/games?page=2`, {
      headers: this.gameHeaders,
    });

    // console.log(response);
  }
  //   get lobby
  getGameLobby() {
    const authObj: object = {
      currency: 'EUR',
      game_uuid: 'e88a563aed2cc6ddbfc263587def1d6d0e0eb145',
    };
    this.gameHeaders = this.xSignGenerate(authObj);
    return this.http.get(`${this.stageURL}/games/lobby`, {
      headers: this.gameHeaders,
    });
  }

//   get all games
  fetchGames(uuid: string) {
    const getData = {
      game_uuid: uuid,
      player_id: 'demo',
      player_name: 'demo_123',
    };

    this.http
      .get(`https://super10.live/api/getGames`, { params: getData })
      .subscribe((res: any) => {
        // console.log('Here is the game initialization response');
        // console.log(res);
      });
  }

  // game initialization request
  // get the game url to redirect the user to
  fetchGameUrl(uuid: string) {
    // console.log(data)
    // const randomNbr = mt_rand();
    // const uniqId = uniqid(randomNbr, true)
    // const uniqId_string = MD5(uniqId).toString();
    // var token: any = JSON.parse(localStorage.getItem('token')!)
    const postData = {
      game_uuid: uuid,
      player_id: 'demo',
      player_name: 'demo_123',
    };
    // ksort(this.defaultHeaderObj);
    // console.log( php_array.ksort(this.defaultHeaderObj))
    // const postData = httpBuildQuery(this.defaultHeaderObj);
    // this.gameHeaders = this.xSignGenerate(this.defaultHeaderObj);
    this.http
      .post(`https://super10.live/api/gamesInit`, postData)
      .subscribe((res: any) => {
        // console.log('here is the game initialization response');
        // console.log(res);
        // assigning the game callback url here
        this.gameUrl = res.message.language_data.url;
        this.router.navigateByUrl('/gameview');
      });
    //   function returning data to calling component here
    return this.gameUrl;
  }

  testValidate() {
    // console.log("Testvalidate Api");
    // console.log(data);
    // const randomNbr = mt_rand();
    // const uniqId = uniqid(randomNbr, true);
    // const uniqId_string = MD5(uniqId).toString();
    // var token: any = JSON.parse(localStorage.getItem('token')!);
    const postData = {
      
      player_id: 'demo',
      player_name: 'demo_123',
    };

    this.http
      .post(`${this.BASE_URL}/testValidate`, postData)
      .subscribe((res: any) => {
        // console.log('Here is the test api response');
        // console.log(res);
      });
    return this.gameUrl;
  }

  xSignGenerate(data: any) {
    const randomNbr = mt_rand();
    const uniqId = uniqid(randomNbr, true);
    const uniqId_string = MD5(uniqId).toString();
    // console.log(data.session_id);
    data = {
      'X-Merchant-Id': 'ae88ab8ee84ff40a76f1ec2e0f7b5caa',
      'X-Nonce': data.session_id ? data.session_id : uniqId_string,
      'X-Timestamp': Math.floor(Date.now() / 1000).toString(),
      ...data,
    };
    const xSignParams = httpBuildQuery(data);
    // console.log(xSignParams);
    const xSign = crypto
      .createHmac('sha1', '4953e491031d3f9e7545223885cf43a7403f14cb')
      .update(xSignParams.toString())
      .digest('hex');
    return new HttpHeaders({
      'X-Merchant-Id': 'ae88ab8ee84ff40a76f1ec2e0f7b5caa',
      'X-Timestamp': data['X-Timestamp'],
      'X-Nonce': data.session_id ? data.session_id : uniqId_string,
      'X-Sign': xSign,
      Accept: 'application/json',
      Enctype: 'application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    });
  }
}
