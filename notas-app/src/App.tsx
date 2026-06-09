import { useCallback, useEffect, useRef, useState } from 'react';
import ToolBar from "./components/ToolBar/ToolBar";
import { useDatabase } from './context/DatabaseContext';
import { ItemData, TabData, TabViewType } from './types';
import Tabs from './components/Tabs/Tabs';
import Postit from './components/Postit/Postit';
import { useMousePosition } from './hooks/useMouseMove';
import ContextMenu, { ContextMenuData } from './components/ContextMenu/ContextMenu';
import trashIcon from "./assets/trash-can.png";
import palletIcon from "./assets/pallete.png";
import { useColorPicker } from './hooks/useColorPicker';

function App() {
  const { db, ready } = useDatabase();
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const currentViewType = useRef<TabViewType>("postit");
  const defaultTabCreated = useRef(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const mouse = useMousePosition();
  const { color, ColorPickerInput, openPicker, setColor } = useColorPicker();
  const [synchedPostitColor, setSynchedPostitColor] = useState<string>("");

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
        setActiveTabId(newTabs[0].id);
      } else {
        setTabs(fetchedTabs);
        setActiveTabId(fetchedTabs[0].id);
      }
    });
  }, [ready]);

  useEffect(() => {
    if (activeTabId === "") return;
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [activeTabId]);

  const addNote = useCallback(async () => {
    if (activeTabId === "") return;
    await db!.saveItem({
      id: crypto.randomUUID(),
      tabId: activeTabId,
      color: "hsl(0, 100%, 50%)",
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
    await db!.saveTab(t);
  }, [ready]);

  const setTabId = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const createTab = useCallback(async () => {
    if (!ready) return;
    await db!.createTab({ color: "", id: crypto.randomUUID(), position: tabs.length++, title: "Página " + tabs.length++, viewType: currentViewType.current });
    db!.getTabsByView(currentViewType.current).then(setTabs);
  }, [ready, currentViewType.current, tabs.length]);

  const removeTab = useCallback(async (id: string) => {
    if (!ready) return;

    let isActualTab = activeTabId === id;

    await db!.deleteTab(id);
    const newTabs = await db!.getTabsByView(currentViewType.current);

    setTabs(newTabs);

    if (isActualTab) setActiveTabId(newTabs[0].id);
  }, [ready, activeTabId])

  const deleteItem = useCallback(async (id: string) => {
    if (!ready) return;
    await db!.deleteItem(id);
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [ready, activeTabId]);

  const openContextMenu = useCallback((x: number, y: number, actions: ContextMenuData['actions']) => {
    setContextMenu({ x, y, mouse, actions });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (!synchedPostitColor) return;
    const foundItem = items.find((i) => synchedPostitColor === i.id)!;
    foundItem.color = color;
    saveItems(foundItem);
  }, [color, synchedPostitColor])

  if (!ready) return <p>Carregando...</p>;

  return (
    <main className="main-container">

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          mouse={mouse}
          actions={contextMenu.actions}
          onClose={closeContextMenu}
        />
      )}

      <div className='search-container'>
        <input type="text" placeholder='Pesquisar nota' />
      </div>

      <div className='main-view'>
        {items.map(i => (
          <Postit
            item={i}
            key={i.id}
            mouse={mouse}
            onDelete={deleteItem}
            onUpdate={saveItems}
            onContextMenu={(x, y) => openContextMenu(x, y, [
              { icon: palletIcon, gridPos: "a", onClick: () => { setColor(i.color); openPicker(mouse.x, mouse.y), setSynchedPostitColor(i.id) } },
              { icon: trashIcon, gridPos: "b", onClick: () => deleteItem(i.id) },
            ])}
          />
        ))}
      </div>

      {ColorPickerInput}

      <Tabs
        activeId={activeTabId}
        tabs={tabs}
        saveTab={saveTab}
        createTab={createTab}
        setActiveTab={setTabId}
        onContextMenu={(x, y, id) => openContextMenu(x, y, [
          { icon: trashIcon, gridPos: "b", onClick: () => removeTab(id) },
        ])}
      />

      <ToolBar onAdd={addNote} />
    </main>
  );
}

export default App;