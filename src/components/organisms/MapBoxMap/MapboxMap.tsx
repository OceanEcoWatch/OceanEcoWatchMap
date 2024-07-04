import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { fetchRegionDatetimes, fetchAoiCenters, fetchPredictions } from '../../../services/mapService'
import { initMap } from '../../../services/mapboxService'
import { addPredictionLayer, removeAllPredictions, removePredictionById } from '../../../services/predictionLayerService'
import { addAoiCentersLayer } from '../../../services/regionLayerService'
import TopBanner from '../OEWHeader/OEWHeader'
import './MapboxMap.css'
import { IRegionData, AoiId } from './types'
import { useQuery } from '@tanstack/react-query'
import { ActionMeta } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [timestampToFetch, setTimestampToFetch] = useState<null | number>(null)
    const [currentSelectedTimestamps, setCurrentSelectedTimestamps] = useState<number[]>([])
    const [currentAoiId, setCurrentAoiId] = useState<AoiId>(null)
    const [currentAoiData, setCurrentAoiData] = useState<null | IRegionData>(null)

    const [mapLoaded, setMapLoaded] = useState(false)

    const {
        isLoading: predictionQueryisLoading,
        isSuccess: predictionQueryIsSuccess,
        data: predictionQueryData,
    } = useQuery({
        queryKey: timestampToFetch && currentAoiData && currentAoiData.id ? ['prediction', timestampToFetch, currentAoiData.id] : ['no-query'],
        queryFn: async () => {
            if (timestampToFetch && currentAoiData && currentAoiData.id) {
                return await fetchPredictions(timestampToFetch, currentAoiData.id)
            }
            return null
        },
        enabled: Boolean(timestampToFetch && currentAoiData && currentAoiData.id),
    })

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
        setTimestampToFetch(null)
    }

    function handleDaySelect(event: ActionMeta<IDayOption>) {
        if (event.action === 'select-option') {
            if (event.option?.value) {
                setTimestampToFetch(event.option.value)
                setCurrentSelectedTimestamps([...currentSelectedTimestamps, event.option.value])
            }
        } else if (event.action === 'remove-value') {
            if (event.removedValue?.value && currentAoiId) {
                removePredictionById(map!, event.removedValue.value, currentAoiId)
                setCurrentSelectedTimestamps(currentSelectedTimestamps.filter((ts) => ts !== event.removedValue.value))
            }
        } else if (event.action === 'clear') {
            if (map) {
                removeAllPredictions(map)
                setCurrentSelectedTimestamps([])
            }
        }

        return
    }


    function handleProbabilityFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
        for (let timestamp of currentSelectedTimestamps) {
            const predictionLayerId = `prediction-${timestamp}-${currentAoiId}`
            const filterValue = parseFloat(e.target.value)
            map!.setFilter(predictionLayerId, ['>=', ['get', 'pixelValue'], filterValue])
        }
    }


    useEffect(() => {
        if (predictionQueryIsSuccess && map) {
            addPredictionLayer(map, timestampToFetch!, currentAoiData!.id, predictionQueryData!)
        }
    }, [predictionQueryIsSuccess, map, predictionQueryData])

    useEffect(() => {
        if (aoiQueryIsSuccess && map && mapLoaded) {
            addAoiCentersLayer(map, aoiQueryData!, setCurrentAoiData, setCurrentAoiId)
        }
    }, [aoiQueryIsSuccess, aoiQueryData])

    useEffect(() => {
        if (timestampQueryIsSuccess && currentAoiId && currentAoiData) {
            setCurrentAoiData({ ...currentAoiData, timestamps: timestampQueryData })
            setTimestampToFetch(timestampQueryData[0])
            setCurrentSelectedTimestamps([timestampQueryData[0]])
            //setIsSidebarOpen(true)
        }
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

            {predictionQueryisLoading && (
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
                handleProbabilityFilterChange={handleProbabilityFilterChange}
                map={map!}
            ></TopBanner>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
