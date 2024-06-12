import React from 'react'
import Toggle from 'react-toggle'
import './MapProjectionButton.css'
import { toggleMapProjection } from '../../../services/mapboxService'

interface MapProjectionButtonProps {
    map: mapboxgl.Map
}

const MapProjectionButton: React.FC<MapProjectionButtonProps> = ({ map }) => {
    return (
        <label className="flex items-center space-x-2">
            <Toggle defaultChecked={false} icons={false} onChange={() => toggleMapProjection(map)} />
            <span>Globe</span>
        </label>
    )
}

export default MapProjectionButton
