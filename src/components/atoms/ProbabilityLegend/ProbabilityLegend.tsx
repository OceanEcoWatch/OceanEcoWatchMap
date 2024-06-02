import { colorCoding } from '../../../common/utils'
import './ProbabilityLegend.css'

interface Probability {
    percent: string
    color: string
}

export const ProbabilityLegend: React.FC = () => {
    const probabilities: Probability[] = [
        { percent: '10%', color: colorCoding[10] },
        { percent: '20%', color: colorCoding[20] },
        { percent: '30%', color: colorCoding[30] },
        { percent: '40%', color: colorCoding[40] },
        { percent: '50%', color: colorCoding[50] },
        { percent: '60%', color: colorCoding[60] },
        { percent: '70%', color: colorCoding[70] },
        { percent: '80%', color: colorCoding[80] },
        { percent: '90%', color: colorCoding[90] },
        { percent: '100%', color: colorCoding[100] },
    ]
    return (
        <div id="legend-div">
            <div className="font-bold text-sm my-5 text-left">Probability Legend</div>

            {probabilities.map((prob) => (
                <div key={prob.percent} className="flex items-center mb-1 text-sm">
                    <span className={`h-4 w-4 block mr-2`} style={{ backgroundColor: prob.color }}></span>
                    <span>{prob.percent}</span>
                </div>
            ))}
        </div>
    )
}
