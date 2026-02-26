export interface IResult {
  result: 'Created' | 'Updated' | 'Deleted';
}

export interface IResultCreated {
  result: 'Created';
  id: number;
}
