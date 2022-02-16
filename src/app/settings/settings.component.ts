import {Component, OnDestroy} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {maxPlayers, signs} from "../screen/game.service";
import {filter, map, Observable, pluck, startWith, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {SettingsService} from "../settings.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnDestroy {

  public readonly form: FormGroup;
  public readonly signs = signs;
  public readonly maxPlayers$: Observable<number>;
  public readonly canNotAddPlayer$: Observable<boolean>
  private readonly maxPlayersSub: Subscription;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {
    const settings = this.settingsService.getSettings();
    this.form = fb.group({
      fieldSize: fb.control(
        settings?.fieldSize ?? 3,
        [
          Validators.min(3),
          Validators.max(10),
          Validators.required
        ]
      ),
      players: fb.array(
        settings?.players?.map(player => fb.control(player.name, Validators.required)) ?? [
          fb.control('', Validators.required),
          fb.control('', Validators.required),
        ]),
    });
    this.maxPlayers$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      filter((_) => this.form.get(['fieldSize'])?.valid ?? false),
      pluck('fieldSize'),
      map(fieldSize => Math.min(Math.ceil(fieldSize / 2), maxPlayers)),
    );
    this.maxPlayersSub = this.maxPlayers$.subscribe(val => this.updatePlayersCount(val));
    this.canNotAddPlayer$ = this.maxPlayers$.pipe(map(max => this.players.length >= max));
  }

  get players(): FormArray {
    return this.form.get('players') as FormArray;
  }

  get fieldSize(): FormControl {
    return this.form.get('fieldSize') as FormControl;
  }

  ngOnDestroy() {
    this.maxPlayersSub.unsubscribe();
  }

  addPlayer() {
    this.players.push(this.fb.control('', Validators.required));
  }

  removePlayer(i: number) {
    this.players.removeAt(i);
  }

  startGame() {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.value;
    const fieldSize = value['fieldSize'] as number;
    const players = (value['players'] as string[]).map(
      (name, i) => ({name, sign: signs[i]})
    );
    this.settingsService.setSettings({fieldSize, players});
    this.router.navigate(['game']);
  }

  private updatePlayersCount(maxPlayersCount: number) {
    while (this.players.length > maxPlayersCount) {
      this.players.removeAt(this.players.length - 1);
    }
  }
}
