import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Game} from "../models/game.model";
import {GameService} from "./game.service";
import {BehaviorSubject, combineLatest, map, Observable, pluck, shareReplay, Subject, tap} from "rxjs";

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.css'],
  providers: [GameService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenComponent implements OnInit, OnDestroy {

  readonly game$: Observable<Game>;
  readonly fieldSize$: Observable<number>;
  readonly cellSize$: Observable<number>;
  private readonly winResizedSubj: Subject<void> = new BehaviorSubject<void>(void 0);

  constructor(
    private readonly gameService: GameService,
  ) {
    this.game$ = gameService.getState();
    window.addEventListener('resize', this.resizeListener);
    this.fieldSize$ = this.winResizedSubj.pipe(
      map(() => Math.max(Math.min(window.innerWidth, window.innerHeight - 100), 100)),
    );
    const field$ = this.game$.pipe(
      pluck('field'),
    );
    this.cellSize$ = combineLatest([this.fieldSize$, field$]).pipe(
      map(([fieldSize, field]) => (fieldSize - (3 * 2 * field.length)) / field.length),
    );
  }

  ngOnInit(): void {
    this.gameService.startNew();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  hit([x, y]: [number, number]) {
    this.gameService.hit(x, y);
  }

  restartGame() {
    this.gameService.restart();
  }

  stop() {
    this.gameService.stop();
  }

  private readonly resizeListener = () => this.onWindowResize();

  private onWindowResize() {
    this.winResizedSubj.next();
  }
}
