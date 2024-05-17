import React, { useEffect, useState } from 'react'
import './App.css'
import MapboxMap from './components/organisms/MapboxMap'
import TopBanner from './components/molecules/TopBanner'
import Logo from './assets/logo.png'

function App() {
    return (
        <div className="App">
            <MapboxMap />
        </div>
    )
}

export default App
