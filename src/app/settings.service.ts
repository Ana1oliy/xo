import {Injectable} from '@angular/core';
import {GameSettings} from "./models/game-settings.model";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private settings: GameSettings | undefined;

  constructor() {
  }

  setSettings(gameSettings: GameSettings) {
    this.settings = {...gameSettings, players: gameSettings.players.slice()};
  }

  getSettings(): GameSettings | null {
    if (this.settings) {
      return {...this.settings, players: this.settings.players.slice()};
    } else {
      return null;
    }
  }
}
