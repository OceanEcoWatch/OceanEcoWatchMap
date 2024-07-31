import './App.css'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { MapboxMap } from './components/organisms/MapBoxMap/MapboxMap'

const queryClient = new QueryClient()

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="App">
                <MapboxMap />
            </div>
        </QueryClientProvider>
    )
}

export default App
