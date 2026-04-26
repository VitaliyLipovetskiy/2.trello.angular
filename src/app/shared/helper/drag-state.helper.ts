type DragType = 'card' | 'list' | null;

let activeDragType: DragType = null;

export const setActiveDragType = (type: DragType): void => {
  activeDragType = type;
};

export const isCardDrag = (): boolean => activeDragType === 'card';
export const isListDrag = (): boolean => activeDragType === 'list';
