// types/Item.ts
export type ItemData = {
  id: string
  tabId: string
  title: string
  description: string
  color: string
  fontColor: string
  posX: number
  posY: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}