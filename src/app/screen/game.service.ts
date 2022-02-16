import {Injectable, OnInit} from '@angular/core';
import {Observable, ReplaySubject, shareReplay, Subject, tap} from "rxjs";
import {Player, playerToString} from "../models/player.model";
import {Game} from "../models/game.model";
import {GameResult} from "../models/game-result.model";
import {HistoryEntry} from "../models/history-entry.model";
import {SettingsService} from "../settings.service";
import {GameSettings} from "../models/game-settings.model";
import {Router} from "@angular/router";

interface GameState {
  field: string[][];
  players: Player[];
  result: GameResult;
  history: HistoryEntry[];
  queue: number[];
}

const distance = 3;
const emptySign = '';
export const signs = ['🞪', '⭘', '△', '◇', '□'];
export const maxPlayers = signs.length;

@Injectable()
export class GameService {

  private readonly gameStateSubj: Subject<Game> = new ReplaySubject<Game>(1);
  private gameState: GameState | undefined;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly router: Router,
  ) {
  }

  startNew() {
    const settings: GameSettings | null = this.settingsService.getSettings();
    if (settings === null) {
      console.error('ОШИБКА: Невозможно начать игру. Параметры не заданы.');
      console.info('Перенаправление на \'/prompt\'.')
      this.goToPrompt();
    } else {
      this.askIfInProgress(() => this.startGame(settings));
    }
  }

  hit(x: number, y: number) {
    if (this.gameState?.field === undefined) {
      throw new Error('Игра не началась');
    }
    if (this.gameState.result.state !== 'inProgress') {
      throw new Error('Игра завершена');
    }
    const currentPlayer = this.gameState.players[this.gameState.queue[0]];
    if (x < 0 || y < 0 || x >= this.gameState.field.length || y >= this.gameState.field.length) {
      throw new Error(`Игрок ${playerToString(currentPlayer)} не попал в поле по координатам (${x}, ${y}).`);
    }
    if (!this.canHit(x, y)) {
      throw new Error(`Игрок ${playerToString(currentPlayer)} совершил недопустимый ход (${x}, ${y}).`);
    }
    this.gameState.field[y][x] = currentPlayer.sign;
    this.gameState.result = checkField(this.gameState.field);
    if (this.gameState.result.state !== 'hasWinner') {
      this.gameState.history.push({player: currentPlayer, x, y});
      this.gameState.queue.shift();
    }
    this.emitState();
  }

  canHit(x: number, y: number): boolean {
    return this.gameState !== undefined && this.gameState.field[y][x] === emptySign;
  }

  getState(): Observable<Game> {
    return this.gameStateSubj.asObservable();
  }

  restart() {
    this.startNew();
  }

  stop() {
    this.askIfInProgress(() => this.goToPrompt());
  }

  // @ts-ignore
  private toState(): Game {
    if (this.gameState != undefined) {
      const players = this.gameState.players;
      return {
        queue: this.gameState.queue.slice(1, distance + 1).map(i => players[i]),
        field: this.gameState.field.map(
          row => row.map(sign => ({sign, canHit: sign === emptySign}))
        ),
        history: this.gameState.history.slice(Math.max(this.gameState.history.length - distance, 0)),
        result: {...this.gameState.result},
        currentPlayer: this.gameState.players[this.gameState.queue[0]],
      };
    }
  }

  private startGame(settings: GameSettings) {
    this.gameState = {
      field: getField(settings.fieldSize),
      players: settings.players.slice(),
      result: {state: 'inProgress'},
      history: [],
      queue: getHitsQueue(settings.fieldSize * settings.fieldSize, settings.players.length),
    }
    this.emitState();
  }

  private emitState() {
    this.gameStateSubj.next(this.toState());
  }

  private askIfInProgress(doOnConfirm: () => void) {
    if (this.gameState?.result.state === 'inProgress') {
      if (confirm('Текущая игра не закончена.\nПродолжить?')) {
        doOnConfirm();
      }
    } else {
      doOnConfirm();
    }
  }

  private goToPrompt() {
    this.router.navigate(['prompt']);
  }
}

export function checkField(field: string[][]): GameResult {
  const diagFromTopSign = field[0][0];
  const diagFromBottomSign = field[0][field.length - 1];
  let diagFromTop = true;
  let diagFromBottom = true;
  let allFilled = true;
  for (let i = 0; i < field.length; i++) {
    diagFromTop = diagFromTop && field[i][i] === diagFromTopSign && field[i][i] !== '';
    diagFromBottom = diagFromBottom && field[i][field.length - 1 - i] === diagFromBottomSign
      && field[i][field.length - 1 - i] !== '';
    let horizSign = field[i][0];
    let vertSign = field[0][i];
    let horiz = true;
    let vert = true;
    for (let j = 0; j < field.length; j++) {
      horiz = horiz && field[i][j] === horizSign && field[i][j] !== '';
      vert = vert && field[j][i] === vertSign && field[j][i] !== '';
      allFilled = allFilled && field[i][j] !== '';
    }
    if (horiz) {
      return {
        state: 'hasWinner',
        strike: {type: 'horizontal', index: i},
      };
    }
    if (vert) {
      return {
        state: 'hasWinner',
        strike: {type: 'vertical', index: i},
      };
    }
  }
  if (diagFromTop) {
    return {
      state: 'hasWinner',
      strike: {type: 'diagonalTopToBottom'},
    };
  }
  if (diagFromBottom) {
    return {
      state: 'hasWinner',
      strike: {type: 'diagonalBottomToTop'},
    };
  }
  if (allFilled) {
    return {state: 'deadHeat'};
  }
  return {state: 'inProgress'};
}

function getField(size: number) {
  const field: string[][] = [];
  for (let i = 0; i < size; i++) {
    field.push(getLine(size));
  }
  return field;
}

function getLine(size: number): string[] {
  const res: string[] = [];
  res.length = size;
  res.fill('');
  return res;
}

function cloneField(field: string[][]): string[][] {
  return field.map(row => row.slice());
}

function getHitsQueue(length: number, playersCount: number): number[] {
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(i % playersCount);
  }
  return result;
}
