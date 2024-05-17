import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchRegionDatetimes, fetchRegions } from '../../services/mapService'
import { Polygon } from 'geojson'
import Logo from '../../assets/logo.png'
import TopBanner from '../molecules/TopBanner'
import {
    addNavigationControls,
    addPolygonLayer,
    addPredictionLayer,
    addRegionLayer,
    getBoundingBox,
    getGlobeMap,
    loadStyles,
} from '../../services/mapboxService'
import { RegionProperties } from '../../interfaces/Aoi'
import './MapboxMap.css'
// todo get rid of unused libraries
// todo cleanup, extract functions into services
// todo were proper component + variable names used?
// todo atomic compoennt structure properly applied?
// add linting + deployment in a github pipeline
// todo sometimes after selecting many timestamps this error occurs: There is already a source with ID "pred-1698537600".
const polygonManillaBay: Polygon = {
    type: 'Polygon',
    coordinates: [
        [
            [120.55445110348722, 14.765904915254623],
            [120.57958428212004, 14.578070043144436],
            [120.55378543294222, 14.370241535899936],
            [120.81447682398743, 14.381734486270588],
            [120.97838024235841, 14.463345459093617],
            [120.9527175423018, 14.62900311142576],
            [120.81052707714883, 14.774179067742779],
            [120.55445110348722, 14.765904915254623],
        ],
    ],
} // todo actual polygon in db?
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY!

const MapboxMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const openSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    let regionId: number = 1 // todo set dynamic

    const [regionProps, setRegionProps] = useState<undefined | RegionProperties>(undefined)

    function handleDaySelect(days: number[]) {
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
                    regionId = e.features![0].properties!.id // todo handle ! better
                    const regionName = e.features![0].properties!.name
                    fetchRegionDatetimes(regionId).then((regionDatetimes) => {
                        map.setLayoutProperty('regions', 'visibility', 'none')
                        map.fitBounds(getBoundingBox(polygonManillaBay)) // todo set polygon dynamic

                        addPolygonLayer(map, polygonManillaBay)
                        openSidebar()
                        const jobs = regionDatetimes.map((regionDatetimes) => regionDatetimes.timestamp)
                        const regionProps: RegionProperties = { id: regionId, name: regionName, jobs: jobs }
                        setRegionProps(regionProps)
                        addPredictionLayer(map, jobs[0], regionId)
                    })
                })
            })
            .catch((error) => console.error('Failed to load regions on map:', error))

        return () => map.remove()
    }, [])

    return (
        <div>
            <TopBanner logo={Logo} isOpen={isSidebarOpen} regionProps={regionProps} handleSelectDays={handleDaySelect}></TopBanner>
            <div ref={mapContainerRef} className="map-container h-screen"></div>
        </div>
    )
}

export default MapboxMap
