import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar.tsx';
import './index.css'

const Marketplace = lazy(() => import('./components/Marketplace.tsx'));
const SellNFT = lazy(() => import('./components/SellNFT.tsx'));
const NFTPage = lazy(() => import('./components/NFTpage.tsx'));
const Profile = lazy(() => import('./components/Profile.tsx'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/sellNFT" element={<SellNFT />} />
              <Route path="/nftPage/:tokenId" element={<NFTPage />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
