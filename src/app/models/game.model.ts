import {Player} from './player.model';
import {GameResult} from "./game-result.model";
import {HistoryEntry} from "./history-entry.model";
import {FieldCell} from "./field-cell.model";

export interface Game {
  field: FieldCell[][];
  currentPlayer: Player;
  queue: Player[];
  history: HistoryEntry[];
  result: GameResult;
}
