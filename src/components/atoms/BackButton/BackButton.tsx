import mapboxgl from 'mapbox-gl'
import React from 'react'
import './BackButton.css'

export const BackButton: React.FC<{ map: mapboxgl.Map }> = ({ map }) => {
    function removePredLayersAndSources(map: mapboxgl.Map) {
        const layers = map.getStyle().layers

        if (layers) {
            layers.forEach((layer) => {
                if (layer.id.startsWith('pred-')) {
                    map.removeLayer(layer.id)
                }
            })
        }
        const sources = map.getStyle().sources
        Object.keys(sources).forEach((sourceId) => {
            if (sourceId.startsWith('pred-')) {
                map.removeSource(sourceId)
            }
        })

        map.removeLayer('polygon-layer')

        map.removeSource('polygon-source')
    }

    function flyOutAddRegionLayer(map: mapboxgl.Map, center: mapboxgl.LngLatLike = [120.825223033, 14.642099128], zoom = 2) {
        map.on('moveend', () => {
            map.setLayoutProperty('regions', 'visibility', 'visible')
        })

        map.flyTo({
            center: center,
            zoom: zoom,
            essential: true,
            speed: 1.7,
        })
    }

    const goBack = () => {
        removePredLayersAndSources(map)
        flyOutAddRegionLayer(map)
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
