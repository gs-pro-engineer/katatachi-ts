import BoardProjection from "./BoardProjection";

export default interface Board {
  board_id: string;
  board_query: {
    q: object;
    sort?: object;
    projections: BoardProjection[];
  },
  count: number
}
