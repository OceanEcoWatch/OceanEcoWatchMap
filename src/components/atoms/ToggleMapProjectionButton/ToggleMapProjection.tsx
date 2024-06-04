import type { MapProjection } from '../../organisms/MapBoxMap/MapboxMap'
import React from 'react'

type ToggleMapProjectionProps = {
    currentProjection: MapProjection
    onClick: () => void
}

const ToggleMapProjectionButton: React.FC<ToggleMapProjectionProps> = ({ onClick, currentProjection }) => {
    return (
        <div className="absolute bottom-2 left-2 p-2 text-xl text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-md flex items-center ">
            <span className={`${currentProjection === 'globe' ? 'text-yellow-500 mr-2' : 'mr-2'}`} onClick={() => onClick()}>
                Globe
            </span>
            <div className="inline-block w-0.5 h-6 bg-gray-500 mr-2"></div>
            <span className={`${currentProjection === 'flat' ? 'text-yellow-500' : ''}`} onClick={() => onClick()}>
                Flat
            </span>
        </div>
    )
}

export default ToggleMapProjectionButton
