import { FeatureCollection, GeoJsonProperties, Point, Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { AoiId, IRegionData } from '../components/organisms/MapBoxMap/types'
import { addAoiBboxLayer } from './aoiBboxLayerService'
import { type } from 'os'

function capitalizeFirstLetterOfEachWord(input: string): string {
    return input
        .split(' ')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')
}

function addRegionPopup(map: mapboxgl.Map) {
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
    })

    map.on('mouseenter', 'regions', (event) => {
        map.getCanvas().style.cursor = 'pointer'

        if (event.features![0].geometry.type === 'Point') {
            const coordinates = event.features![0].geometry.coordinates.slice() ?? []
            const name = event.features![0].properties?.name
            const area = event.features![0].properties?.area_km2
            const description = `<strong>${capitalizeFirstLetterOfEachWord(name)}</strong><br>Size of the region: ${area.toFixed(2)} km<sup>2</sup>`

            while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360
            }
            popup.setLngLat([coordinates[0], coordinates[1]]).setHTML(description).addTo(map)
        }
    })
    map.on('mouseleave', 'regions', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
}

export function addAoiCentersLayer(
    map: mapboxgl.Map,
    regions: FeatureCollection<Point, GeoJsonProperties>,
    stateSetter: (regionData: IRegionData) => void,
    setCurrentAoiId: (aoiId: AoiId) => void,
): void {
    map.addSource('aoi-centers', {
        type: 'geojson',
        data: regions,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 100,
    })

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'aoi-centers',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': '#ff0000',
            'circle-radius': 9,
            'circle-stroke-width': 6,
            'circle-stroke-color': '#660000',
        },
    })

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'aoi-centers',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
        },
    })

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'aoi-centers',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#ff0000',
            'circle-radius': 6,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#660000',
        },
    })

    addRegionPopup(map)

    map.on('click', 'unclustered-point', async (e) => {
        // Check if the properties object exists
        if (!e.features || !e.features[0]?.properties) {
            console.error('No properties found')
            return
        }

        const regionId = e.features[0].properties!.id
        const regionName = e.features[0].properties.name
        const regionSize = e.features[0].properties.area_km2
        const regionPolygon: Polygon = JSON.parse(e.features[0].properties.polygon)
        const bbox = JSON.parse(e.features[0].properties.bbox)

        map.fitBounds(bbox, { padding: 88 })
        hideAoiCenters(map)
        addAoiBboxLayer(map, regionPolygon)
        stateSetter({
            id: regionId,
            timestamps: [],
            name: regionName,
            areaSize: regionSize,
            polygon: regionPolygon,
        })
        setCurrentAoiId(regionId)
    })

    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
        })
        const clusterId = features[0].properties!.cluster_id
        //@ts-ignore
        map.getSource('aoi-centers')!.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return

            map.easeTo({
                //@ts-ignore
                center: features[0].geometry.coordinates,
                zoom: zoom,
            })
        })
    })
}

export function hideAoiCenters(map: mapboxgl.Map) {
    map.setLayoutProperty('clusters', 'visibility', 'none')
    map.setLayoutProperty('cluster-count', 'visibility', 'none')
    map.setLayoutProperty('unclustered-point', 'visibility', 'none')
}

export function showAoiCenters(map: mapboxgl.Map) {
    map.setLayoutProperty('clusters', 'visibility', 'visible')
    map.setLayoutProperty('cluster-count', 'visibility', 'visible')
    map.setLayoutProperty('unclustered-point', 'visibility', 'visible')
}

function addClusteredRegionPopup(map: mapboxgl.Map, content: string) {
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
    })

    map.on('mouseenter', 'clusteredRegions', (event) => {
        map.getCanvas().style.cursor = 'pointer'

        if (event.features![0].geometry.type === 'Point') {
            const coordinates = event.features![0].geometry.coordinates.slice() ?? []
            const name = event.features![0].properties?.name
            const area = event.features![0].properties?.area_km2

            while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360
            }
            popup.setLngLat([coordinates[0], coordinates[1]]).setHTML(content).addTo(map)
        }
    })
    map.on('mouseleave', 'clusteredRegions', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })
}
