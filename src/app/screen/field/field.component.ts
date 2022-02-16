import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from "../../models/game.model";

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css']
})
export class FieldComponent implements OnInit {

  @Input()
  fieldSize: number | null | undefined;

  @Input()
  cellSize: number | null | undefined;

  @Input()
  state: Game | null | undefined;

  @Output()
  hit = new EventEmitter<[number, number]>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onCellClick(x: number, y: number) {
    if (this.state?.field[y][x].canHit) {
      this.hit.emit([x, y]);
    }
  }

}
