import Database from "@tauri-apps/plugin-sql"
import { TabData, ItemData, TabViewType } from "./types"

export class DatabaseConnection {

    private static _instance: DatabaseConnection | null = null
    private db!: Database

    private constructor() { }

    private async connect() {
        this.db = await Database.load("sqlite:notes.db")
        await this.migrate()
    }

    private async migrate() {
        await this.db!.execute(`
    CREATE TABLE IF NOT EXISTS tabs (
      id TEXT PRIMARY KEY,
      view_type TEXT NOT NULL CHECK(view_type IN ('postit', 'lista', 'grid')),
      color TEXT DEFAULT 'hsl(0, 0%, 0%)',
      title TEXT NOT NULL,
      position INTEGER NOT NULL
    )
  `)

        await this.db!.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      tab_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      color TEXT DEFAULT '#ffeb3b',
      fontColor TEXT DEFAULT 'hsl(0, 0%, 6%)',
      pos_x INTEGER DEFAULT 0,
      pos_y INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
    )
  `)
    }

    public static async get(): Promise<DatabaseConnection> {
        if (!this._instance) {
            this._instance = new DatabaseConnection()
            await this._instance.connect()
        }
        return this._instance
    }

    // Tabs
    public async getTabsByView(viewType: TabViewType): Promise<TabData[]> {
        return this.db.select("SELECT * FROM tabs WHERE view_type = $1 ORDER BY position", [viewType])
    }

    public async createTab(tab: TabData): Promise<void> {
        await this.db.execute(
            "INSERT INTO tabs (id, view_type, color, title, position) VALUES ($1, $2, $3, $4, $5)",
            [tab.id, tab.viewType, tab.color, tab.title, tab.position]
        )
    }

    public async deleteTab(id: string): Promise<void> {
        await this.db.execute("DELETE FROM tabs WHERE id = $1", [id])
    }

    // Items
    public async getItemsByTab(tabId: string): Promise<ItemData[]> {
        const rows = await this.db.select<any[]>(
            "SELECT * FROM items WHERE tab_id = $1", [tabId]
        )
        return rows.map(row => ({
            id: row.id,
            tabId: row.tab_id,
            title: row.title,
            description: row.description,
            color: row.color,
            fontColor: row.fontColor,
            posX: row.pos_x,
            posY: row.pos_y,
            sortOrder: row.sort_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))
    }

    public async saveItem(item: ItemData): Promise<void> {
        await this.db.execute(
            `INSERT OR REPLACE INTO items (id, tab_id, title, description, color, fontColor, pos_x, pos_y, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [item.id, item.tabId, item.title, item.description, item.color, item.fontColor, item.posX, item.posY, item.sortOrder]
        )
    }

    public async saveTab(tab: TabData): Promise<void> {
        await this.db.execute(
            `UPDATE tabs SET color = $1, title = $2, position = $3 WHERE id = $4`, [tab.color, tab.title, tab.position, tab.id]
        )
    } 

    public async deleteItem(id: string): Promise<void> {
        await this.db.execute("DELETE FROM items WHERE id = $1", [id])
    }
}