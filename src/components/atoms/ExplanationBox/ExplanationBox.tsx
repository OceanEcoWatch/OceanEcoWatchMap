import './ExplanationBox.css'

export const ExplanationBox: React.FC<{ message: string; show: boolean }> = ({ message, show }) => {
    return <div className={`explanation-box ${show ? 'show' : ''}`}>{message}</div>
}
