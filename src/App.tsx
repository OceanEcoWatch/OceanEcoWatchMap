import './App.css'
import MapboxMap from './components/organisms/MapBoxMap/MapboxMap'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="App">
                <MapboxMap />
            </div>
        </QueryClientProvider>
    )
}

export default App
