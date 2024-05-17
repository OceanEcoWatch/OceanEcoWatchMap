import React from 'react'
import './BackButton.css'

export const BackButton: React.FC = () => {
    const goBack = () => {
        window.location.reload() // todo instead remove all pred and aoi layers + fly to zoom level xy + unset sidebar details
    }

    return (
        <button
            id="button-div"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm py-2 px-4 rounded shadow-lg"
            onClick={goBack}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-2">
                <path d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
        </button>
    )
}
