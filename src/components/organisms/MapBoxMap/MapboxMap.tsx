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
    const [selectedTimestamps, setSelectedTimestamps] = useState<number[]>([])
    const [timestampToFetch, setTimestampToFetch] = useState<null | number>(null)

    const [currentAoiData, setCurrentAoiData] = useState<null | IRegionData>(null)
    const [mapLoaded, setMapLoaded] = useState(false)

    // const {
    //     isLoading: predictionQueryisLoading,
    //     isSuccess: predictionQueryIsSuccess,
    //     data: predictionQueryData,
    // } = useQuery({
    //     queryKey: ['prediction', timestampToFetch, currentAoiData!.id],
    //     queryFn: async () => await fetchPredictions(timestampToFetch!, currentAoiData!.id),
    //     enabled: Boolean(timestampToFetch && currentAoiData!.id),
    //     refetchOnWindowFocus: false,
    // })

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
        // queryFn: fetchRegions,
        queryFn: async () => await fetchAoiCenters(),
        refetchOnWindowFocus: false,
    })

    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    function handleDaySelect(days: number[]) {
        return
    }

    // useEffect(() => {
    //     if (predictionQueryIsSuccess && map) {
    //         addPredictionLayer(map, timestampToFetch!, currentAoiData!.id, predictionQueryData!)
    //     }
    // }, [predictionQueryIsSuccess, map])

    useEffect(() => {
        console.log('aoiQueryData', aoiQueryData, map, mapLoaded)
        if (aoiQueryIsSuccess && mapLoaded && map && mapLoaded) {
            addAoiCentersLayer(map, aoiQueryData!, setCurrentAoiData)
        }
    }, [aoiQueryData, aoiQueryIsSuccess, map, mapLoaded])

    useEffect(() => {
        if (timestampQueryIsSuccess && map && currentAoiData) {
            setCurrentAoiData({ ...currentAoiData, timestamps: timestampQueryData })
            // const jobs = regionDatetimes.map((regionDatetimes) => regionDatetimes.timestamp)

            // addPredictionLayer(map, jobs[0], currentAoiData!.id)
        }
    }, [timestampQueryIsSuccess])

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
            {/* <TopBanner logo={Logo} isOpen={isSidebarOpen} regionProps={currentAoiData} handleSelectDays={handleDaySelect} map={map!}></TopBanner> */}
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
