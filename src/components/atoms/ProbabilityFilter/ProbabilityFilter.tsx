import './ProbabilityFilter.css'
export const ProbabilityFilter: React.FC<{
    probabilityThreshold: number
    setProbabilityThreshold: React.Dispatch<React.SetStateAction<number>>
}> = ({ probabilityThreshold, setProbabilityThreshold }) => {
    function handleProbabilityChange(e: React.ChangeEvent<HTMLInputElement>) {
        setProbabilityThreshold(parseInt(e.target.value))
    }

    return (
        <div id="">
            <div className="font-bold text-sm my-5 text-left">Probability Filter</div>
            <div className="flex justify-between w-full">
                <input
                    id="probability-slider"
                    value={probabilityThreshold}
                    min="30"
                    max="100"
                    className="slider"
                    type="range"
                    onChange={(e) => handleProbabilityChange(e)}
                ></input>

                <span className="font-bold">{probabilityThreshold}%</span>
            </div>
        </div>
    )
}
