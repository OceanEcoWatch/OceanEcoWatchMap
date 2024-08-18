import { useEffect, useState } from 'react'
import './ProbabilityFilter.css'

export const ProbabilityFilter: React.FC<{ map: mapboxgl.Map; aoiId: number }> = ({ map, aoiId }) => {
    const [currentProbability, setCurrentProbability] = useState(30)

    function handleProbabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCurrentProbability(parseInt(e.target.value))
    }

    useEffect(() => {
        //Set filter for heatmap and prediction layer
        if (map.getLayer(`prediction-${aoiId}-heatmap`)) {
            map.setFilter(`prediction-${aoiId}-heatmap`, ['>', ['get', 'pixelValue'], currentProbability])
        }
        if (map.getLayer(`prediction-${aoiId}-point`)) {
            map.setFilter(`prediction-${aoiId}-point`, ['>', ['get', 'pixelValue'], currentProbability])
        }

        return () => {
            // cleanup function (removing all filters when component unmounts)
            if (map.getLayer(`prediction-${aoiId}-heatmap`)) {
                map.setFilter(`prediction-${aoiId}-heatmap`, null)
            }
            if (map.getLayer(`prediction-${aoiId}-point`)) {
                map.setFilter(`prediction-${aoiId}-point`, null)
            }
        }
    }, [aoiId, currentProbability, map])

    return (
        <div id="">
            <div className="font-bold text-sm my-5 text-left">Probability Filter</div>
            <div className="flex justify-between w-full">
                <input
                    id="probability-slider"
                    value={currentProbability}
                    min="30"
                    max="100"
                    className="slider"
                    type="range"
                    onChange={(e) => handleProbabilityChange(e)}
                ></input>

                <span className="font-bold">{currentProbability}%</span>
            </div>
        </div>
    )
}
