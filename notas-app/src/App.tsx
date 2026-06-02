//import { invoke } from "@tauri-apps/api/core";

//import { useEffect, useState } from "react";
import { useCallback, useState } from 'react';
import Postit, { PostitData } from './components/Postit/Postit';
import ToolBar from "./components/ToolBar/ToolBar";

function App() {

  const [postitArr, setPostItArr] = useState<Map<string, PostitData>>(new Map());

  const addPostIt = useCallback(() => {
    setPostItArr((prev) => new Map(prev).set((prev.size+1).toString(), {
      title: "", 
      description: "", 
      onDelete: () => onDelete((prev.size+1).toString())
    }))
  }, []);

  const onDelete = useCallback((id : string) => {    
    setPostItArr((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    })
  }, []);

  return (
    <main className="main-container">

      <div className='search-container'>
        <input type="text" placeholder='Pesquisar nota'/>
      </div>

      <div className='main-view'>
        {[...postitArr.entries()].map(([id, p]) => <Postit key={id} postit={p} />)}
      </div>

      

      <ToolBar
        onAdd={addPostIt}
      />
    </main>
  );
}

export default App;
