import mapboxgl from 'mapbox-gl'
import React from 'react'
import './BackButton.css'
import { removeAllPredictions } from '../../../services/predictionLayerService'
import { showAoiCenters } from '../../../services/regionLayerService'
import { removeAoiBboxLayer } from '../../../services/aoiBboxLayerService'

export const BackButton: React.FC<{ map: mapboxgl.Map; handleDeselectAoi: () => void }> = ({ map, handleDeselectAoi }) => {
    function handleGoBack() {
        removeAllPredictions(map)
        removeAoiBboxLayer(map)
        showAoiCenters(map)
        handleDeselectAoi()

        const currentCenter = map.getCenter()
        map.flyTo({
            center: currentCenter,
            zoom: 10,
            essential: true,
            speed: 1.7,
        })
    }

    return (
        <button
            id="button-div"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm py-2 px-4 rounded shadow-lg"
            onClick={handleGoBack}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-2">
                <path d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
        </button>
    )
}
