import React, { useState, useEffect } from 'react'
import { Model } from '../../organisms/MapBoxMap/types'
import './ModelButtons.css'
import { ExplanationBox } from '../ExplanationBox/ExplanationBox'

export const ModelButtons: React.FC<{ model: Model; setModel: (model: Model) => void }> = ({ model, setModel }) => {
    const [showExplanation, setShowExplanation] = useState(false)
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (hoveredButton) {
            timer = setTimeout(() => {
                setShowExplanation(true)
            }, 1000)
        } else {
            setShowExplanation(false)
        }
        return () => clearTimeout(timer)
    }, [hoveredButton])

    const handleMouseEnter = (buttonName: string) => {
        setHoveredButton(buttonName)
    }

    const handleMouseLeave = () => {
        setHoveredButton(null)
    }

    return (
        <div className="button-container">
            <button
                className={`button ${model === Model.MariNext ? 'button-disabled' : 'button-enabled'}`}
                onClick={() => setModel(Model.Marida)}
                onMouseEnter={() => handleMouseEnter(Model.Marida)}
                onMouseLeave={handleMouseLeave}
            >
                {Model.Marida}
            </button>

            <button
                className={`button ${model === Model.Marida ? 'button-disabled' : 'button-enabled'}`}
                onClick={() => setModel(Model.MariNext)}
                onMouseEnter={() => handleMouseEnter(Model.MariNext)}
                onMouseLeave={handleMouseLeave}
            >
                {Model.MariNext}
            </button>

            {hoveredButton && <ExplanationBox message={`You are looking at the Model: ${hoveredButton}`} show={showExplanation} />}
        </div>
    )
}
