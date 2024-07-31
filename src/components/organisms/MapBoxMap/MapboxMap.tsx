import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { fetchRegionDatetimes, fetchAoiCenters, fetchCurrentAoiMetaData } from '../../../services/mapService'
import { initMap } from '../../../services/mapboxService'
import { addPredictionLayer, removeAllPredictions } from '../../../services/predictionLayerService'
import { addAoiCentersLayer } from '../../../services/regionLayerService'
import './MapboxMap.css'
import { IRegionData, AoiId, CurrentAoiMetaData, Model } from './types'
import { useQuery } from '@tanstack/react-query'
import { ActionMeta } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'
import { FeatureCollection, Point } from 'geojson'
import { IPredProperties } from '../../../interfaces/api/IPredProperties'
import { usePredictionQuery } from '../usePredictionQuery'
import { getBeginningOfUTCDay } from '../../../common/utils'
import { OEWHeader } from '../OEWHeader/OEWHeader'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const [predictionQueryParams, setPredictionQueryParams] = useState<{ timestamp: number; aoiId: number; model: Model } | undefined>(undefined)
    const [shouldAddToPredictions, setShouldAddToPredictions] = useState<boolean>(false)
    const [model, setModel] = useState<Model>(Model.Marida)
    const {
        isPending: predictionQueryIsPending,
        isFetching: predictionQueryIsFetching,
        isSuccess: predictionQueryIsSuccess,
        data: predictionQueryData,
        isLoading: predictionQueryIsLoading,
    } = usePredictionQuery(predictionQueryParams?.timestamp, predictionQueryParams?.aoiId!, predictionQueryParams?.model)

    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)

    const [currentAoiId, setCurrentAoiId] = useState<AoiId>(null)
    const [currentAoiData, setCurrentAoiData] = useState<null | IRegionData>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [currentAoiMetaData, setCurrentAoiMetaData] = useState<CurrentAoiMetaData>({ timestampWithSignificantPlastic: 'no ,' })
    const [currentPredictions, setCurrentPredictions] = useState<null | FeatureCollection<Point, IPredProperties>>(null)

    const getUniqueSelectedTimestamps = (): number[] => {
        const uniqueCurrentTimestamps: number[] = []
        if (currentPredictions && currentPredictions.features) {
            for (const feature of currentPredictions.features) {
                if (!uniqueCurrentTimestamps.includes(feature.properties.timestamp)) {
                    uniqueCurrentTimestamps.push(feature.properties.timestamp)
                }
            }
        }
        return uniqueCurrentTimestamps
    }
    const {
        isLoading: timestampQueryisLoading,
        isSuccess: timestampQueryIsSuccess,
        data: timestampQueryData,
    } = useQuery({
        initialData: [],
        queryFn: async () => await fetchRegionDatetimes(currentAoiData!.id),
        //enabled: false, // enabled: Boolean(currentAoiData && currentAoiData.id),
        enabled: Boolean(currentAoiData && currentAoiData.id),
        queryKey: ['timestamp', currentAoiData?.id],
        refetchOnWindowFocus: false,
    })

    const {
        isLoading: aoiQueryIsLoading,
        isSuccess: aoiQueryIsSuccess,
        data: aoiQueryData,
    } = useQuery({
        initialData: null,
        queryKey: ['aoi'],
        queryFn: async () => await fetchAoiCenters(),
        refetchOnWindowFocus: false,
    })

    const {
        isLoading: currentAoiMetaDataQueryisLoading,
        isSuccess: currentAoiMetaDataQueryIsSuccess,
        data: currentAoiMetaDataQueryData,
    } = useQuery({
        queryFn: async () => await fetchCurrentAoiMetaData(currentAoiId!),
        enabled: Boolean(currentAoiId),
        queryKey: ['currentAoiMetaData', currentAoiId],
        refetchOnWindowFocus: false,
    })

    function handleDeselectAoi() {
        setCurrentAoiId(null)
        setCurrentAoiData(null)
        setCurrentPredictions(null)
    }

    async function handleDaySelect(event: ActionMeta<IDayOption>) {
        if (event.action === 'select-option') {
            //set the timestamp to fetch the prediction
            setPredictionQueryParams({ timestamp: event.option!.value!, aoiId: currentAoiId!, model: model })
            setShouldAddToPredictions(true)
        } else if (event.action === 'remove-value') {
            const timestampToRemove = event.removedValue.value
            //filter out the removed value from the feature collection currentPredictions
            if (!currentPredictions || !currentPredictions?.features) {
                setCurrentPredictions(null)
                return
            }

            const remainingFeatures = currentPredictions!.features.filter(
                (feature) => getBeginningOfUTCDay(feature.properties.timestamp) !== timestampToRemove,
            )
            if (remainingFeatures.length! > 0) {
                setCurrentPredictions({ type: 'FeatureCollection', features: remainingFeatures })
                return
            } else {
                setCurrentPredictions(null)
            }
        } else if (event.action === 'clear') {
            setCurrentPredictions(null)
        }
        return
    }
    useEffect(() => {
        setPredictionQueryParams({ ...predictionQueryParams!, model: model })
        setShouldAddToPredictions(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model])

    //use Effect to add new predictions that were fetched by react query
    useEffect(() => {
        if (!predictionQueryData || !predictionQueryIsSuccess || !shouldAddToPredictions) return

        if (currentPredictions && currentPredictions.features.length > 0) {
            setCurrentPredictions({ type: 'FeatureCollection', features: [...currentPredictions.features, ...predictionQueryData.features] })
            setShouldAddToPredictions(false)
        } else {
            setCurrentPredictions(predictionQueryData)
            setShouldAddToPredictions(false)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [predictionQueryIsSuccess, predictionQueryData, shouldAddToPredictions])

    //use Effect to update the prediction layer on the map
    useEffect(() => {
        if (map) {
            removeAllPredictions(map)
            if (currentPredictions && currentAoiId) {
                addPredictionLayer(map, currentAoiId, currentPredictions)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPredictions])

    useEffect(() => {
        if (aoiQueryIsSuccess && map && mapLoaded) {
            addAoiCentersLayer(map, aoiQueryData!, setCurrentAoiData, setCurrentAoiId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aoiQueryIsSuccess, aoiQueryData])

    useEffect(() => {
        if (timestampQueryIsSuccess && currentAoiId && currentAoiData) {
            setCurrentAoiData({ ...currentAoiData, timestamps: timestampQueryData })
            setShouldAddToPredictions(true)
            setPredictionQueryParams({ timestamp: timestampQueryData[0], aoiId: currentAoiId, model: model })
            //setIsSidebarOpen(true)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timestampQueryIsSuccess, currentAoiId, timestampQueryData])

    useEffect(() => {
        const map = initMap(mapContainerRef, setMapLoaded)
        setMap(map)
        return () => map.remove()
    }, [])

    useEffect(() => {
        if (currentAoiMetaDataQueryIsSuccess) {
            setCurrentAoiMetaData(currentAoiMetaDataQueryData)
        }
    }, [currentAoiMetaDataQueryIsSuccess, currentAoiMetaDataQueryData])
    return (
        <div>
            {aoiQueryIsLoading && (
                <div
                    style={{
                        zIndex: 1000,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Optional: This will add a semi-transparent black background
                    }}
                >
                    <h1 style={{ color: 'white' }}>Loading AOIs</h1>
                </div>
            )}

            {timestampQueryisLoading && (
                <div
                    style={{
                        zIndex: 1000,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                >
                    <h1 style={{ color: 'white' }}>Fetching Timestamps</h1>
                </div>
            )}

            {predictionQueryIsLoading && (
                <div
                    style={{
                        zIndex: 1000,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                >
                    <h1 style={{ color: 'white' }}>Fetching Prediction of a Day...</h1>
                </div>
            )}

            <OEWHeader
                logo={Logo}
                isOpen={!!currentAoiId}
                regionProps={currentAoiData}
                currentAoiMetaData={currentAoiMetaData}
                handleSelectedDaysChange={handleDaySelect}
                handleDeselectAoi={handleDeselectAoi}
                map={map!}
                isBusy={predictionQueryIsPending || predictionQueryIsFetching}
                uniqueSelectedTimestamps={getUniqueSelectedTimestamps()}
                model={model}
                setModel={setModel}
            ></OEWHeader>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
