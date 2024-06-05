import { Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'

import { fetchRegionDatetimes, fetchAoiCenters, fetchPredictions } from '../../../services/mapService'
import { addNavigationControls, getGlobeMap, initMap, loadStyles } from '../../../services/mapboxService'
import { addPredictionLayer } from '../../../services/predictionLayerService'
import { addAoiCentersLayer } from '../../../services/regionLayerService'
import TopBanner from '../OEWHeader/OEWHeader'
import './MapboxMap.css'
import { IRegionData, AoiId } from './types'
import { useQuery } from '@tanstack/react-query'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [timestampToFetch, setTimestampToFetch] = useState<null | number>(null)

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

    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    function handleDaySelect(days: number[]) {
        console.log('handleDaySelect', days)
        //fetches last added day
        setTimestampToFetch(days[days.length - 1])
        return
    }

    useEffect(() => {
        console.log('predictionQueryData', predictionQueryData, predictionQueryIsSuccess)
        if (predictionQueryIsSuccess && map) {
            console.log('predictionQueryData add LAyer')
            addPredictionLayer(map, timestampToFetch!, currentAoiData!.id, predictionQueryData!)
        }
    }, [predictionQueryIsSuccess, map, predictionQueryData])

    useEffect(() => {
        console.log('aoiQueryData', aoiQueryData, map, mapLoaded, aoiQueryIsSuccess)
        if (aoiQueryIsSuccess && map && mapLoaded) {
            addAoiCentersLayer(map, aoiQueryData!, setCurrentAoiData, setCurrentAoiId)
        }
    }, [aoiQueryIsSuccess, aoiQueryData])

    useEffect(() => {
        if (timestampQueryIsSuccess && currentAoiId && currentAoiData) {
            setCurrentAoiData({ ...currentAoiData, timestamps: timestampQueryData })
            setTimestampToFetch(timestampQueryData[0])
            setIsSidebarOpen(true)
        }
    }, [timestampQueryIsSuccess, currentAoiId, timestampQueryData])

    useEffect(() => {
        // const map = getGlobeMap(mapContainerRef)
        // setMap(map)
        // loadStyles(map)
        // addNavigationControls(map)

        const map = initMap(mapContainerRef, setMapLoaded)
        setMap(map)

        return () => map.remove()
    }, [])

    return (
        <div>
            <TopBanner logo={Logo} isOpen={isSidebarOpen} regionProps={currentAoiData} handleSelectDays={handleDaySelect} map={map!}></TopBanner>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
