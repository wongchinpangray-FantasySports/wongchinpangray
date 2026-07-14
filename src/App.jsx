import { BrowserRouter, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import ClubManagementDetail from './pages/ClubManagementDetail'
import FplContentDetail from './pages/FplContentDetail'
import FplEngagementDetail from './pages/FplEngagementDetail'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/content/fpl-creator"
          element={<FplContentDetail />}
        />
        <Route
          path="/projects/fpl-engagement-platform"
          element={<FplEngagementDetail />}
        />
        <Route
          path="/projects/amateur-football-club-management"
          element={<ClubManagementDetail />}
        />
      </Routes>
    </BrowserRouter>
  )
}
