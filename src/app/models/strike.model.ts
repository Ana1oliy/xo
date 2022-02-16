export type StrikeType =
  | 'horizontal'
  | 'vertical'
  | 'diagonalTopToBottom'
  | 'diagonalBottomToTop'
  | 'none';

export interface Strike {
  index?: number,
  type: StrikeType;
}
