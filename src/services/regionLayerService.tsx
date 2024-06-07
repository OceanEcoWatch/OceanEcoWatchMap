import { FeatureCollection, GeoJsonProperties, Point, Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { AoiId, IRegionData } from '../components/organisms/MapBoxMap/types'
import { addAoiBboxLayer } from './aoiBboxLayerService'

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
    console.log('Adding aoi centers layer', regions)

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
            'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
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
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
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
