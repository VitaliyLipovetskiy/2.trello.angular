export interface ICard {
  id: number;
  title: string;
  position: number;
  color?: string;
  description?: string;
  custom?: {
    deadline: string;
  };
  users: number[];
  created_at?: number;
}

export interface ICardCreate {
  title: string;
  list_id: number;
  position: number;
  description?: string;
  custom?: {
    deadline: string;
  };
}

export interface ICardUpdate {
  title: string;
  list_id: number;
  description?: string;
}
