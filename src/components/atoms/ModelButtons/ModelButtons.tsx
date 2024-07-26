import { Model } from '../../organisms/MapBoxMap/types'

export const ModelButtons: React.FC<{ model: Model; setModel: (model: Model) => void }> = ({ model, setModel }) => {
    const buttonClassName = 'flex items-center justify-center text-white text-xs py-2 px-4 rounded shadow-lg'
    const disabledButtonClassName = 'bg-gray-800'
    const enabledButtonClassName = 'bg-gray-500'

    return (
        <div className="flex align-middle">
            <button
                className={`${buttonClassName} ${model === Model.MariNext ? disabledButtonClassName : enabledButtonClassName}`}
                disabled={model === Model.Marida}
                onClick={() => setModel(Model.Marida)}
            >
                {Model.Marida}
            </button>

            <button
                className={`${buttonClassName} ${model === Model.Marida ? disabledButtonClassName : enabledButtonClassName}`}
                disabled={model === Model.MariNext}
                onClick={() => setModel(Model.MariNext)}
            >
                {Model.MariNext}
            </button>
        </div>
    )
}
