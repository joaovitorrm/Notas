// types/Item.ts
export type ItemData = {
  id: string
  tabId: string
  title: string
  titleFont: string
  titleColor: string
  description: string
  descriptionFont: string
  descriptionColor: string
  backgroundColor: string
  isMinimized: boolean
  posX: number
  posY: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}