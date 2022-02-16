import {Component} from '@angular/core';
import {GameService} from "./screen/game.service";
import {map, Observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'xo';
  public readonly inGame$: Observable<boolean>;

  constructor(gameService: GameService) {
    this.inGame$ = gameService.getState().pipe(map(state => state != null));
  }
}
