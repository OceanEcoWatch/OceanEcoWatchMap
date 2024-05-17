import './ProbabilityLegend.css'

interface Probability {
    percent: string
    color: string
}

export const ProbabilityLegend: React.FC = () => {
    const probabilities: Probability[] = [
        { percent: '10%', color: 'bg-green-200' },
        { percent: '20%', color: 'bg-green-400' },
        { percent: '30%', color: 'bg-yellow-200' },
        { percent: '40%', color: 'bg-yellow-400' },
        { percent: '50%', color: 'bg-yellow-600' },
        { percent: '60%', color: 'bg-orange-200' },
        { percent: '70%', color: 'bg-orange-400' },
        { percent: '80%', color: 'bg-red-400' },
        { percent: '90%', color: 'bg-red-600' },
        { percent: '100%', color: 'bg-red-800' },
    ]
    return (
        <div id="legend-div">
            <div className="font-bold text-sm my-5 text-left">Probability Legend</div>

            {probabilities.map((prob) => (
                <div key={prob.percent} className="flex items-center mb-1 text-sm">
                    <span className={`h-4 w-4 ${prob.color} block mr-2`}></span>
                    <span>{prob.percent}</span>
                </div>
            ))}
        </div>
    )
}
