import {Strike} from "./strike.model";

export type GameState = 'inProgress' | 'deadHeat' | 'hasWinner';

export interface GameResult {
  state: GameState;
  strike?: Strike;
}
