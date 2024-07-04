import React, { useState } from 'react'
import Toggle from 'react-toggle'
import { toggleMapProjection } from '../../../services/mapboxService'
import './MapProjectionButton.css'

interface MapProjectionButtonProps {
    map: mapboxgl.Map
}

const MapProjectionButton: React.FC<MapProjectionButtonProps> = ({ map }) => {
    const [displayMap, setDisplayMap] = useState(true)

    function onToggle() {
        setDisplayMap(!displayMap)
        toggleMapProjection(map)
    }

    function getLabel() {
        if (displayMap) {
            return 'Globe'
        } else {
            return 'Map'
        }
    }

    return (
        <label className="flex items-center space-x-2">
            {!displayMap && <span>Map</span>}
            <Toggle defaultChecked={false} icons={false} onChange={onToggle} />
            {displayMap && <span>Globe</span>}
        </label>
    )
}

export default MapProjectionButton
