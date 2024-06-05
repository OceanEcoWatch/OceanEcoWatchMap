import { Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { IRegionData, IRegionProperties } from '../../../interfaces/IRegionProperties'
import { fetchRegionDatetimes, fetchRegions } from '../../../services/mapService'
import { addNavigationControls, getGlobeMap, loadStyles } from '../../../services/mapboxService'
import { addPolygonLayer, addPredictionLayer, getBoundingBox } from '../../../services/predictionLayerService'
import { addRegionLayer } from '../../../services/regionLayerService'
import TopBanner from '../OEWHeader/OEWHeader'
import './MapboxMap.css'
import { useQuery } from '@tanstack/react-query'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    // this causes the react query hook to refetch the data with the state is updated to null, so i left it emtpy
    // const [regionId, setRegionId] = useState<number | null>(null)
    const [regionId, setRegionId] = useState<number>()
    const [fetchingPredictionsForDay, setFetchingPredictionsForDay] = useState<number>()

    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const [regionProps, setRegionProps] = useState<undefined | IRegionProperties>(undefined)
    const [regionData, setRegionData] = useState<undefined | IRegionData>(undefined)

    function handleDaySelect(days: number[]) {
        console.log('Selected days:', days)
        let toBeAddedDays = days
        if (!map || !map.getStyle()) {
            console.error('Map is not initialized or no style is loaded')
            return
        }

        if (regionId === null) {
            console.error('No region selected')
            return
        }

        const style = map.getStyle()
        // set layers invisible that are currently not selected
        style.layers.forEach((layer) => {
            if (layer.id.startsWith('pred-')) {
                const layerJob = parseInt(layer.id.split('-')[1])
                if (!days.includes(layerJob)) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none')
                }
            }
        })
        // add newly selected days
        toBeAddedDays.forEach((day) => {
            console.log('Adding day:', day)
            if (map.getLayer(`pred-${day}:${regionId}`)) {
                map.setLayoutProperty(`pred-${day}:${regionId}`, 'visibility', 'visible')
            } else {
                setFetchingPredictionsForDay(day)
                //use thhis reacr query hook to fetch the data
                //const { data: jobPredictions, isLoading, error } = useJobPredictions(datetime, regionId);
                //addPredictionLayer(map, day, regionId!)
            }
        })
    }

    const { isPending: fetchingPredictionOfDay } = useQuery({
        queryKey: [`pred-${fetchingPredictionsForDay}:${regionId}`],
        queryFn: () => addPredictionLayer(map!, fetchingPredictionsForDay, regionId),
        enabled: fetchingPredictionsForDay !== null && regionId !== null,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        const map = getGlobeMap(mapContainerRef)

        setMap(map)
        loadStyles(map)
        addNavigationControls(map)

        return () => map.remove()
    }, [])

    const { isPending: fetchingAoiCenters, data } = useQuery({
        queryKey: ['regions'],
        queryFn: async () => await fetchRegions(),
    })

    useEffect(() => {
        console.log('this is the useEffect and it dfired')
        if (data && map) {
            console.log('actualy logic')
            loadRegionsOnMap(data)
        }
    }, [data, map])

    //fails on hot reload, page reload works fine
    function loadRegionsOnMap(regions: any) {
        if (!map) {
            console.error('Map is not initialized')
            return
        }
        addRegionLayer(map, regions)

        map.on('click', 'regions', (e) => {
            const regionId = e.features![0].properties!.id
            const regionName = e.features![0].properties!.name
            const regionSize = e.features![0].properties!.area_km2
            const regionPolygon: Polygon = JSON.parse(e.features![0].properties!.polygon)

            const regionData: IRegionData = {
                id: regionId,
                name: regionName,
                areaSize: regionSize,
                polygon: regionPolygon,
            }

            //this causes the react query hook to refetch the data with the new regionId
            setRegionId(e.features![0].properties!.id)
            setRegionData(regionData)

            return
        })
    }

    async function fetchRegionDatetimesWithTimeout(regionId: number) {
        if (!map) return []
        if (!regionId) return []

        //timout to simulate loading
        //await new Promise((resolve) => setTimeout(resolve, 1000))

        const regionDatetimes = await fetchRegionDatetimes(regionId)
        const regionJobs = regionDatetimes.map((regionDatetimes) => regionDatetimes.timestamp)

        setFetchingPredictionsForDay(regionJobs[0])
        addPredictionLayer(map, regionJobs[0], regionId)

        map.setLayoutProperty('regions', 'visibility', 'none')
        map.fitBounds(getBoundingBox(regionData?.polygon!))

        addPolygonLayer(map, regionData?.polygon!)
        openSidebar()

        if (regionData && regionJobs) {
            const newRegionProps: IRegionProperties = {
                id: regionData.id,
                name: regionData.name,
                areaSize: regionData.areaSize,
                jobs: regionJobs,
            }
            setRegionProps(newRegionProps)
        }

        return regionDatetimes
    }

    const { isPending: fetchingRegionData } = useQuery({
        queryKey: [`regionData${regionId}`, regionId],
        queryFn: async () => await fetchRegionDatetimesWithTimeout(regionId!),
        enabled: !regionId,
        refetchOnWindowFocus: false,
    })

    return (
        <div style={{ position: 'relative' }}>
            {fetchingAoiCenters && (
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
                    <h1 style={{ color: 'white' }}>Loading...</h1>
                </div>
            )}

            {fetchingRegionData && (
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
                    <h1 style={{ color: 'white' }}>Fetching Regions Data...</h1>
                </div>
            )}

            {fetchingPredictionOfDay && (
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

            <TopBanner logo={Logo} isOpen={isSidebarOpen} regionProps={regionProps} handleSelectDays={handleDaySelect} map={map!}></TopBanner>
            <div ref={mapContainerRef} className="h-screen"></div>
        </div>
    )
}

export default MapboxMap
