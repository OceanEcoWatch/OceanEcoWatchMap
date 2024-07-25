import { FeatureCollection, GeoJsonProperties, Geometry, Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useState } from 'react'
import { SCL_COLOR, SCL_NAME } from '../../../interfaces/api/ISCLProperties'

const MapProjectionButton: React.FC<{ className: string; map: mapboxgl.Map; geoData: Geometry[] }> = ({ className, map, geoData }) => {
    const [isActive, setIsActive] = useState(false)

    function onClick() {
        setIsActive(!isActive)
    }

    useEffect(() => {
        displayFunction(isActive) // add layer to show the polygon fo the class / remove layer to hide the polygon
        return () => {
            displayFunction(false) // remove layer when component is unmounted (useEffect cleanup)
        }
        function displayFunction(shouldShow: boolean) {
            if (shouldShow) {
                const featureCollection: FeatureCollection<Polygon, GeoJsonProperties> = {
                    type: 'FeatureCollection',
                    features: geoData.map((geometry) => ({
                        type: 'Feature',
                        geometry: geometry as Polygon,
                        properties: {},
                    })),
                }

                map.addSource(`scl-layer-${className}`, {
                    type: 'geojson',
                    data: featureCollection,
                })

                map.addLayer({
                    id: `scl-layer-${className}`,
                    type: 'fill',
                    source: `scl-layer-${className}`,
                    paint: {
                        'fill-color': SCL_COLOR[className as keyof typeof SCL_COLOR],
                        'fill-opacity': 0.5, // Set the opacity value here (0.0 - 1.0)
                    },
                })
            } else {
                if (map.getLayer(`scl-layer-${className}`)) {
                    //remove if layer exists
                    map.removeLayer(`scl-layer-${className}`)
                    map.removeSource(`scl-layer-${className}`)
                }
            }
        }
    }, [className, geoData, isActive, map])

    return (
        <div>
            <button onClick={onClick}>{SCL_NAME[className as keyof typeof SCL_NAME]}</button>
        </div>
    )
}

export default MapProjectionButton
