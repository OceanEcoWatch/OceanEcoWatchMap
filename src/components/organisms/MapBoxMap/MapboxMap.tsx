import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { fetchRegionDatetimes, fetchAoiCenters } from '../../../services/mapService'
import { initMap } from '../../../services/mapboxService'
import { addPredictionLayer, removeAllPredictions } from '../../../services/predictionLayerService'
import { addAoiCentersLayer } from '../../../services/regionLayerService'
import TopBanner from '../OEWHeader/OEWHeader'
import './MapboxMap.css'
import { IRegionData, AoiId } from './types'
import { useQuery } from '@tanstack/react-query'
import { ActionMeta } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'
import { FeatureCollection, Point } from 'geojson'
import { IPredProperties } from '../../../interfaces/api/IPredProperties'
import { usePredictionQuery } from '../usePredictionQuery'
import { getBeginningOfUTCDay } from '../../../common/utils'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const [predictionQueryParams, setPredictionQueryParams] = useState<{ timestamp: number; aoiId: number } | null>(null)
    const [shouldAddToPredictions, setShouldAddToPredictions] = useState<boolean>(false)
    const {
        isPending: predictionQueryIsPending,
        isFetching: predictionQueryIsFetching,
        isSuccess: predictionQueryIsSuccess,
        data: predictionQueryData,
        isLoading: predictionQueryIsLoading,
    } = usePredictionQuery(predictionQueryParams?.timestamp, predictionQueryParams?.aoiId!)

    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)

    const [currentAoiId, setCurrentAoiId] = useState<AoiId>(null)
    const [currentAoiData, setCurrentAoiData] = useState<null | IRegionData>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [currentPredictions, setCurrentPredictions] = useState<null | FeatureCollection<Point, IPredProperties>>(null)

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

    // const openSidebar = () => {
    //     setIsSidebarOpen(!isSidebarOpen)
    // }

    function handleDeselectAoi() {
        setCurrentAoiId(null)
        setCurrentAoiData(null)
        setCurrentPredictions(null)
    }

    async function handleDaySelect(event: ActionMeta<IDayOption>) {
        if (event.action === 'select-option') {
            //set the timestamp to fetch the prediction
            setPredictionQueryParams({ timestamp: event.option!.value!, aoiId: currentAoiId! })
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
        } else {
            console.error('map is null')
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
            setPredictionQueryParams({ timestamp: timestampQueryData[0], aoiId: currentAoiId })
            //setIsSidebarOpen(true)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timestampQueryIsSuccess, currentAoiId, timestampQueryData])

    useEffect(() => {
        const map = initMap(mapContainerRef, setMapLoaded)
        setMap(map)
        return () => map.remove()
    }, [])

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

            <TopBanner
                logo={Logo}
                isOpen={!!currentAoiId}
                regionProps={currentAoiData}
                handleSelectedDaysChange={handleDaySelect}
                handleDeselectAoi={handleDeselectAoi}
                map={map!}
                isBusy={predictionQueryIsPending || predictionQueryIsFetching}
            ></TopBanner>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
