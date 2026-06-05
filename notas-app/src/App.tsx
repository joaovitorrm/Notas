//import { invoke } from "@tauri-apps/api/core";

import { useCallback, useEffect, useRef, useState } from 'react';
import ToolBar from "./components/ToolBar/ToolBar";
import { useDatabase } from './context/DatabaseContext';
import { ItemData, TabData, TabViewType } from './types';
import Tabs from './components/Tabs/Tabs';
import Postit from './components/Postit/Postit';

function App() {
  const { db, ready } = useDatabase();
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const currentViewType = useRef<TabViewType>("postit");
  const defaultTabCreated = useRef(false);

  // Inicialização — roda uma vez quando o banco está pronto
  useEffect(() => {
    if (!ready) return;

    db!.getTabsByView(currentViewType.current).then(async fetchedTabs => {
      if (fetchedTabs.length === 0 && !defaultTabCreated.current) {
        defaultTabCreated.current = true;
        await db!.createTab({
          color: "hsl(0, 0%, 0%)",
          title: "Página 1",
          viewType: "postit",
          id: crypto.randomUUID(),
          position: 1
        });
        const newTabs = await db!.getTabsByView(currentViewType.current);
        setTabs(newTabs);
        setActiveTabId(newTabs[0].id); // ← define aqui direto
      } else {
        setTabs(fetchedTabs);
        setActiveTabId(fetchedTabs[0].id); // ← define aqui direto
      }
    });
  }, [ready]);

  // Carrega items quando a tab ativa muda
  useEffect(() => {
    if (activeTabId === "") return;
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [activeTabId]);

  const addNote = useCallback(async () => {
    if (activeTabId === "") return;
    await db!.saveItem({
      id: crypto.randomUUID(),
      tabId: activeTabId,
      color: "hsl(0, 50%, 50%)",
      fontColor: "hsl(0, 0%, 0%)",
      description: "",
      sortOrder: 1,
      title: "",
      posX: 20,
      posY: 20
    });
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [activeTabId]);

  const saveItems = useCallback(async (i: ItemData) => {
    if (!ready) return;
    await db!.saveItem(i);
  }, [ready]);

  const saveTab = useCallback(async (t: TabData) => {
    if (!ready) return;
    console.log("save");
    await db!.saveTab(t);
  }, [ready]);

  const setTabId = useCallback((id: string) => {
    setActiveTabId(id);
  }, [])

  const createTab = useCallback(async () => {
    if (!ready) return;
    await db!.createTab({color: "", id: crypto.randomUUID(), position: tabs.length++, title: "Página " + tabs.length++, viewType: currentViewType.current});
    db!.getTabsByView(currentViewType.current).then(setTabs);
  }, [ready, currentViewType.current, tabs.length])

  const onDelete = useCallback(async (i : string) => {
    if (!ready) return;
    await db!.deleteItem(i);
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [ready, activeTabId])

  if (!ready) return <p>Carregando...</p>;

  return (
    <main className="main-container">
      <div className='search-container'>
        <input type="text" placeholder='Pesquisar nota' />
      </div>

      <div className='main-view'>
        {items.map(i => (
          <Postit
            item={i}
            postit={{ onDelete: onDelete, onUpdate: saveItems }}
            key={i.id}
          />
        ))}
      </div>

      <Tabs activeId={activeTabId} tabs={tabs} saveTab={saveTab} createTab={createTab} setActiveTab={setTabId} /* onTabChange={setActiveTabId} */ />

      <ToolBar onAdd={addNote} />
    </main>
  );
}

export default App;
