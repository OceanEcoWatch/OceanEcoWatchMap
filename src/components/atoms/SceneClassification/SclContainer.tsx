import React, { useEffect, useState } from 'react'
import { useSclQuery } from './useSclInfo'
import { FeatureCollection, Geometry, Polygon } from 'geojson'
import { ISCLProperties } from '../../../interfaces/api/ISCLProperties'

import mapboxgl from 'mapbox-gl'
import { SclButton } from './SceneClassButton'

export const SCLInformationContainer: React.FC<{
    selectedTimestamps: number[]
    currentAoiId: number
    map: mapboxgl.Map
}> = ({ selectedTimestamps, currentAoiId, map }) => {
    const [useSclQueryParams, setUseSclQueryParams] = useState<{ selectedTimestamps: number; currentAoiId: number } | undefined>(undefined)
    const { isPending, isSuccess, data, isLoading } = useSclQuery(useSclQueryParams?.selectedTimestamps, useSclQueryParams?.currentAoiId)
    const [mappedObject, setMappedObject] = useState<MappedObject | null>(null)
    useEffect(() => {
        if (selectedTimestamps.length === 1) {
            setUseSclQueryParams({ selectedTimestamps: selectedTimestamps[0], currentAoiId: currentAoiId })
        }
    }, [selectedTimestamps, currentAoiId])

    useEffect(() => {
        if (isSuccess && data.features) {
            setMappedObject(mapFeaturesDynamically(data))
        }

        function mapFeaturesDynamically(source: FeatureCollection<Polygon, ISCLProperties>): MappedObject {
            const result: MappedObject = {}

            source.features.forEach((feature) => {
                const classification = feature.properties.classification

                // Initialize array for new classifications
                if (!result[classification]) {
                    result[classification] = []
                }

                // Add the geometry to the appropriate classification
                result[classification].push(feature.geometry)
            })

            return result
        }
    }, [data, isSuccess])

    interface MappedObject {
        [key: string]: Geometry[]
    }

    return (
        <div>
            {selectedTimestamps.length > 1 && <p>Select only one timestamp to request scene classification data</p>}
            {selectedTimestamps.length < 1 && <p>Select one timestamp to request scene classification data</p>}
            {selectedTimestamps.length === 1 && (isPending || isLoading) && <p>Loading...</p>}
            {selectedTimestamps.length === 1 && !mappedObject && <p>Sorry! We have no scene information for this timestamp...</p>}
            {selectedTimestamps.length === 1 && mappedObject && (
                <div>
                    {Object.keys(mappedObject).map((classification) => (
                        <SclButton key={classification} className={classification} map={map} geoData={mappedObject[classification]} />
                    ))}
                </div>
            )}
        </div>
    )
}
