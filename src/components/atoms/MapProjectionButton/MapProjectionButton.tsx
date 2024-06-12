import React from 'react'
import Toggle from 'react-toggle'
import './MapProjectionButton.css'

export type MapProjection = 'globe' | 'flat'

type ToggleMapProjectionProps = {
    currentProjection: MapProjection
    handleOnChange: () => void
}

const ToggleMapProjectionButton: React.FC<ToggleMapProjectionProps> = ({ handleOnChange, currentProjection }) => {
    return (
        <label className="flex items-center space-x-2">
            <Toggle defaultChecked={false} icons={false} onChange={handleOnChange} />
            <span>Globe</span>
        </label>
    )
}

export default ToggleMapProjectionButton
