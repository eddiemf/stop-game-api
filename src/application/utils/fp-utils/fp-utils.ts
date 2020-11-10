export const appendToList = <ListItemType>(
  list: ListItemType[],
  item: ListItemType
): ListItemType[] => [...list, item];

export const removeFromList = <ListItemType>(
  list: ListItemType[],
  index: number
): ListItemType[] => [...list.slice(0, index), ...list.slice(index + 1)];

export const insertToList = <ListItemType>(
  list: ListItemType[],
  item: ListItemType,
  index: number
): ListItemType[] => [...list.slice(0, index), item, ...list.slice(index)];
