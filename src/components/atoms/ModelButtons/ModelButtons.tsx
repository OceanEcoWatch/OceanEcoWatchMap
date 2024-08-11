import { useState } from 'react'
import { Model } from '../../organisms/MapBoxMap/types'
import './ModelButton.css'

export const ModelButtons: React.FC<{ model: Model; setModel: (model: Model) => void }> = ({ model, setModel }) => {
    const buttonClassName = 'flex items-center justify-center text-white text-xs py-2 px-4 rounded shadow-lg'
    const disabledButtonClassName = 'bg-gray-800'
    const enabledButtonClassName = 'bg-gray-500'
    const [showTooltip, setShowTooltip] = useState(false)
    const [showTooltip2, setShowTooltip2] = useState(false)

    return (
        <div className="button-container">
            <button
                className={` mr-2 ${buttonClassName} ${model === Model.MariNext ? disabledButtonClassName : enabledButtonClassName}`}
                disabled={model === Model.Marida}
                onClick={() => setModel(Model.Marida)}
            >
                {Model.Marida}
            </button>
            <div className="tooltip-container">
                <button
                    className={`mr-2 w-8 h-8 text-lg text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-full`}
                    onClick={() => setShowTooltip(!showTooltip)}
                >
                    i
                </button>
                {showTooltip && (
                    <div className="tooltip-box">
                        <p>
                            This model was published by Marc Rußwurm. It's based on the <a href="https://marine-debris.github.io/">Marida</a> dataset.
                            For more details chckout his paper{' '}
                            <a href="https://www.researchgate.net/publication/372136277_Large-scale_Detection_of_Marine_Debris_in_Coastal_Areas_with_Sentinel-2">
                                Large-scale Detection of Marine Debris in Coastal Areas with Sentinel-2
                            </a>
                        </p>
                        <button
                            onClick={() => setShowTooltip(false)}
                            className="bg-gray-900 hover:bg-gray-900 text-white font-bold text-sm py-2 px-4 rounded shadow-lg"
                        >
                            close
                        </button>
                    </div>
                )}
            </div>

            <button
                className={`mr-2 ${buttonClassName} ${model === Model.Marida ? disabledButtonClassName : enabledButtonClassName}`}
                disabled={model === Model.MariNext}
                onClick={() => setModel(Model.MariNext)}
            >
                {Model.MariNext}
            </button>

            <div className="tooltip-container">
                <button
                    className={`w-8 h-8 text-lg text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-full`}
                    onClick={() => setShowTooltip2(!showTooltip2)}
                >
                    i
                </button>
                {showTooltip2 && (
                    <div className="tooltip-box tooltip-box-2">
                        <p>
                            This model was published by Katerina Kikaki. It's based on the <a>Mados</a> dataset. For more details read the paper{' '}
                            <a href="https://www.sciencedirect.com/science/article/pii/S0924271624000625">
                                Detecting Marine pollutants and Sea Surface features with Deep learning in Sentinel-2 imagery
                            </a>
                        </p>
                        <button
                            onClick={() => setShowTooltip2(!showTooltip2)}
                            className="bg-gray-900 hover:bg-gray-900 text-white font-bold text-sm py-2 px-4 rounded shadow-lg"
                        >
                            close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
