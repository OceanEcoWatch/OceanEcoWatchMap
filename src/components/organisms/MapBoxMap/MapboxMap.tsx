import { Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import Logo from '../../../assets/logo.png'
import { IRegionProperties } from '../../../interfaces/IRegionProperties'
import { fetchRegionDatetimes, fetchRegions } from '../../../services/mapService'
import { addNavigationControls, getGlobeMap, loadStyles } from '../../../services/mapboxService'
import { addPolygonLayer, addPredictionLayer, getBoundingBox } from '../../../services/predictionLayerService'
import { addRegionLayer } from '../../../services/regionLayerService'
import TopBanner from '../OEWHeader/OEWHeader'
import './MapboxMap.css'
import { RegionId } from './types'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [regionId, setRegionId] = useState<RegionId>(null)

    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const [regionProps, setRegionProps] = useState<undefined | IRegionProperties>(undefined)

    function handleDaySelect(days: number[]) {
        if (!regionId) {
            console.error('Cannot handleDaySelect - No region selected')
            return
        }
        let toBeAddedDays = days
        if (!map || !map.getStyle()) {
            console.error('Map is not initialized or no style is loaded')
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
            if (map.getLayer(`pred-${day}`)) {
                map.setLayoutProperty(`pred-${day}`, 'visibility', 'visible')
            } else {
                addPredictionLayer(map, day, regionId)
            }
        })
    }

    useEffect(() => {
        const map = getGlobeMap(mapContainerRef)
        setMap(map)
        loadStyles(map)
        addNavigationControls(map)

        fetchRegions()
            .then((regions) => {
                addRegionLayer(map, regions)
                map.on('click', 'regions', (e) => {
                    const regionIdToSet = e.features![0].properties!.id
                    if (!regionIdToSet) {
                        console.error('Failed to set regionId, click event missing:', regionIdToSet)
                        return
                    }
                    setRegionId(regionIdToSet) // This is async, so we will continue with the var "regionIdToSet"
                    const regionName = e.features![0].properties!.name
                    const regionSize = e.features![0].properties!.area_km2

                    const aoiPolygon: Polygon = JSON.parse(e.features![0].properties!.polygon)

                    fetchRegionDatetimes(regionIdToSet).then((regionDatetimes) => {
                        map.setLayoutProperty('regions', 'visibility', 'none')
                        map.fitBounds(getBoundingBox(aoiPolygon))

                        addPolygonLayer(map, aoiPolygon)
                        openSidebar()
                        const jobs = regionDatetimes.map((regionDatetimes) => regionDatetimes.timestamp)
                        const regionProps: IRegionProperties = {
                            id: regionIdToSet,
                            name: regionName,
                            jobs: jobs,
                            areaSize: regionSize,
                        }
                        setRegionProps(regionProps)
                        addPredictionLayer(map, jobs[0], regionIdToSet)
                    })
                })
            })
            .catch((error) => console.error('Failed to load regions on map:', error))

        return () => map.remove()
    }, [])

    return (
        <div>
            <TopBanner logo={Logo} isOpen={isSidebarOpen} regionProps={regionProps} handleSelectDays={handleDaySelect} map={map!}></TopBanner>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
