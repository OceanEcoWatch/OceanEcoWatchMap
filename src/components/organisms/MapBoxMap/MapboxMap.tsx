import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { fetchRegionDatetimes, fetchAoiCenters, fetchCurrentAoiMetaData, fetchPredictions } from '../../../services/mapService'
import { initMap } from '../../../services/mapboxService'
import { addPredictionLayer, removeAllPredictions } from '../../../services/predictionLayerService'
import { addAoiCentersLayer } from '../../../services/regionLayerService'
import './MapboxMap.css'
import { IRegionData, AoiId, CurrentAoiMetaData, Model } from './types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IDayOption } from '../../../interfaces/IDayOption'
import { FeatureCollection, Point } from 'geojson'
import { IPredProperties } from '../../../interfaces/api/IPredProperties'
import { OEWHeader } from '../OEWHeader/OEWHeader'
import moment from 'moment'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

export const MapboxMap: React.FC = () => {
    const queryClient = useQueryClient()
    const [model, setModel] = useState<Model>(Model.Marida)
    const [selectedDays, setSelectedDays] = useState<readonly IDayOption[]>([])
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [fetchingPredictions, setFetchingPredictions] = useState<boolean>(false)
    const [currentAoiId, setCurrentAoiId] = useState<AoiId>(null)
    const [currentAoiData, setCurrentAoiData] = useState<null | IRegionData>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [currentAoiMetaData, setCurrentAoiMetaData] = useState<CurrentAoiMetaData>({ timestampWithSignificantPlastic: 'no data' })
    const [currentPredictions, setCurrentPredictions] = useState<null | FeatureCollection<Point, IPredProperties>>(null)
    const [possibleDays, setPossibleDays] = useState<IDayOption[]>([])

    //set the possible days for the day select component depending on the aoi info
    useEffect(() => {
        if (currentAoiData && currentAoiData.timestamps) {
            const days: IDayOption[] = []
            currentAoiData.timestamps.forEach((timestamp) => {
                const readableTimestamp = moment.unix(timestamp).format('DD.MM.YYYY HH:mm')
                days.push({ value: timestamp, label: readableTimestamp })
            })
            setPossibleDays(days)
        }
    }, [currentAoiData])

    useEffect(() => {
        const updatePredictions = async () => {
            setFetchingPredictions(true)
            const results = await Promise.all(
                selectedDays.map((dayData) =>
                    queryClient.fetchQuery({
                        queryKey: ['prediction', dayData.value, currentAoiId, model],
                        queryFn: async () => await fetchPredictions(dayData.value, currentAoiId!, model!),
                        staleTime: Infinity, // Data never becomes stale
                    }),
                ),
            )
            let newPredictions: FeatureCollection<Point, IPredProperties> = { type: 'FeatureCollection', features: [] }
            results.forEach((result) => {
                newPredictions = { type: 'FeatureCollection', features: [...newPredictions.features, ...result.features] }
            })
            setCurrentPredictions(newPredictions)
            setFetchingPredictions(false)
        }
        if (selectedDays.length > 0 && currentAoiId && model) {
            updatePredictions()
        } else {
            setCurrentPredictions(null)
        }
        return () => {
            setCurrentPredictions(null)
            setFetchingPredictions(false)
        }
    }, [selectedDays, currentAoiId, model, queryClient])

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

    const { isSuccess: currentAoiMetaDataQueryIsSuccess, data: currentAoiMetaDataQueryData } = useQuery({
        queryFn: async () => await fetchCurrentAoiMetaData(currentAoiId!),
        enabled: Boolean(currentAoiId),
        queryKey: ['currentAoiMetaData', currentAoiId],
        refetchOnWindowFocus: false,
    })

    function handleDeselectAoi() {
        setCurrentAoiId(null)
        setCurrentAoiData(null)
        setCurrentPredictions(null)
        setSelectedDays([])
    }

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

            {fetchingPredictions && (
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
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                possibleDays={possibleDays}
                handleDeselectAoi={handleDeselectAoi}
                map={map!}
                model={model}
                setModel={setModel}
            ></OEWHeader>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}
