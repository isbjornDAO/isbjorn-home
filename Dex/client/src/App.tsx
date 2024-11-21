import { Routes, Route } from 'react-router-dom'

import './globals.css'
import { ToastContextProvider } from '@/context/ToastContext';
import RootLayout from '@/_root/RootLayout';
import { Artic, Collect, Initiatives, NotFound, Swap } from '@/_root/pages'

const App = () => {
  return (
    <ToastContextProvider>
      <main className="flex h-screen">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path='/artic' element={<Artic />} />
            <Route path='/collect' element={<Collect />} />
            <Route path='/initiatives' element={<Initiatives />} />
            <Route path="*" element={<NotFound />} />
            <Route index element={<Swap />} />
            <Route path='/swap' element={<Swap />} />
          </Route>

        </Routes>

      </main>
    </ToastContextProvider>
  )
}

export default App
