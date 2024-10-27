import {Navbar} from "@/components/ui/navbar.tsx";
import {BaseRoutes} from "./routes/base.tsx";


function App() {
  return (
      <div className={' h-[calc(100vh-4rem)] bg-bg-light dark:bg-bg-dark'}>
          <Navbar/>
          <BaseRoutes />
      </div>
  )
}

export default App
