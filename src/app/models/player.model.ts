export interface Player {
  readonly sign: string;
  readonly name: string;
}

export function playerToString(player: Player): string {
  return `${player.name} [${player.sign}]`;
}
