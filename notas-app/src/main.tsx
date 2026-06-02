import ReactDOM from "react-dom/client";

import './global.css'
import App from "./App";

// main.tsx
import { DatabaseProvider } from './context/DatabaseContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>
)