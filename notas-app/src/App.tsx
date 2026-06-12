import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ToolBar from "./components/ToolBar/ToolBar";
import { useDatabase } from './context/DatabaseContext';
import { ItemData, TabData, TabViewType } from './types';
import Tabs from './components/ToolBar/Tabs';
import { useMousePosition } from './hooks/useMouseMove';
import ContextMenu, { ContextMenuData } from './components/ContextMenu/ContextMenu';
import trashIcon from "./assets/trash-can.png";
import Postits from './views/Postits';
import { ViewHandle } from './types/viewHandle';

function App() {
  const { db, ready } = useDatabase();
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [currentViewType, setCurrentViewType] = useState<TabViewType>("postit");
  const defaultTabCreated = useRef(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const mouse = useMousePosition();
  const viewRef = useRef<ViewHandle>(null);

  useEffect(() => {
    if (!ready) return;
    db!.getTabsByView(currentViewType).then(async fetchedTabs => {
      if (fetchedTabs.length === 0 && !defaultTabCreated.current) {
        defaultTabCreated.current = true;
        await db!.createTab({
          color: "hsl(0, 0%, 0%)",
          title: "Página 1",
          viewType: "postit",
          id: crypto.randomUUID(),
          position: 1
        });
        const newTabs = await db!.getTabsByView(currentViewType);
        setTabs(newTabs);
        setActiveTabId(newTabs[0].id);
      } else {
        setTabs(fetchedTabs);
        setActiveTabId(fetchedTabs[0].id);
      }
    });
  }, [ready]);

  // ITEM

  const addItem = useCallback((i: ItemData) => {
    setItems((prev) => [...prev, i])
  }, []);

  const saveItem = useCallback(async (i: ItemData) => {
    if (!ready) return;
    await db!.saveItem(i);
  }, [ready]);

  const updateItem = useCallback((i: ItemData) => {
    setItems(prev => prev.map((prevItem) => prevItem.id === i.id ? i : prevItem))
  }, []);

  const updateAndSaveItem = useCallback(async (i: ItemData) => {
    updateItem(i);
    saveItem(i);
  }, [saveItem]);

  const addAndSaveItem = useCallback((i: ItemData) => {
    addItem(i);
    saveItem(i);
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    if (!ready) return;
    await db!.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, [ready, activeTabId]);

  // TABS

  useEffect(() => {
    if (activeTabId === "") return;
    db!.getItemsByTab(activeTabId).then(setItems);
  }, [activeTabId]);

  const createTab = useCallback(async () => {
    if (!ready) return;
    const pos = tabs.length + 1;
    await db!.createTab({ color: "", id: crypto.randomUUID(), position: pos, title: "Página " + pos, viewType: currentViewType });
    db!.getTabsByView(currentViewType).then(setTabs);
  }, [ready, currentViewType, tabs.length]);

  const setTabId = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const saveTab = useCallback(async (t: TabData) => {
    if (!ready) return;
    await db!.saveTab(t);
  }, [ready]);

  const removeTab = useCallback(async (id: string) => {
    if (!ready) return;

    let isActualTab = activeTabId === id;

    await db!.deleteTab(id);
    const newTabs = await db!.getTabsByView(currentViewType);

    if (newTabs.length === 0) {
      setTabs([]);
      setActiveTabId("");
      setItems([]);
      return;
    }

    setTabs(newTabs);
    if (isActualTab) setActiveTabId(newTabs[0].id);
  }, [ready, activeTabId]);

  const openContextMenu = useCallback((e: React.MouseEvent, x: number, y: number, actions: ContextMenuData['actions']) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x, y, mouse, actions });
  }, [mouse]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const currentView = useMemo(() => {
    switch (currentViewType) {
      case "postit": return <Postits
        deleteItem={deleteItem}
        saveItem={saveItem}
        updateItem={updateItem}
        updateAndSaveItem={updateAndSaveItem}
        addAndSaveItem={addAndSaveItem}
        addItem={addItem}
        items={items}
        mouse={mouse}
        openContextMenu={openContextMenu}
        tabId={activeTabId}
        ref={viewRef}
      />;
    }
  }, [currentViewType, items, activeTabId, deleteItem, saveItem, updateItem, addItem, mouse, openContextMenu]);

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

      {currentView}

      <Tabs
        activeId={activeTabId}
        tabs={tabs}
        saveTab={saveTab}
        createTab={createTab}
        setActiveTab={setTabId}
        onContextMenu={(e, x, y, id) => openContextMenu(e, x, y, [
          { icon: trashIcon, gridPos: "b", onClick: () => removeTab(id) },
        ])}
      />

      {<ToolBar onAdd={() => viewRef.current?.addNote()} />}
    </main>
  );
}

export default App;