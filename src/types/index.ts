export type Config = {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  count: number;
  imgSrc: string;
  containerWidth?: number;
  containerHeight?: number;
};

export type GroupedItems = {
  id: string;
  userInfo: any;
  assistantInfo: any;
};
