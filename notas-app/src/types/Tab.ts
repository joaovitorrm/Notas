
export type TabViewType = 'postit' | 'lista' | 'grid';

// types/Tab.ts
export type TabData = {
  id: string
  viewType: TabViewType
  color: string
  title: string
  position: number
}
