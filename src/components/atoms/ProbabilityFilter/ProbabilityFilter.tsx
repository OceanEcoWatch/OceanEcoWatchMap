import { useState } from 'react'
import './ProbabilityFilter.css'

interface IProbabilityFilterProps {
    handleProbabilityFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ProbabilityFilter: React.FC<IProbabilityFilterProps> = ({ handleProbabilityFilterChange }) => {
    const [currentProbability, setCurrentProbability] = useState(30)

    function handleProbabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCurrentProbability(parseInt(e.target.value))
        handleProbabilityFilterChange(e)
    }

    return (
        <div id="">
            <div className="font-bold text-sm my-5 text-left">Probability Filter</div>
            <div className="flex justify-between w-full">
                <input
                    id="probability-slider"
                    value={currentProbability}
                    min="30"
                    max="100"
                    type="range"
                    onChange={(e) => handleProbabilityChange(e)}
                ></input>

                <span className="font-bold">{currentProbability}%</span>
            </div>
        </div>
    )
}
