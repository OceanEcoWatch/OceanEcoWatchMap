import { Feature, FeatureCollection, GeoJsonProperties, Point } from 'geojson'
import mapboxgl from 'mapbox-gl'

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

export function addRegionLayer(map: mapboxgl.Map, regions: FeatureCollection<Point, GeoJsonProperties>) {
    map.addSource('regions', {
        type: 'geojson',
        data: regions,
    })

    map.addLayer({
        id: 'regions',
        type: 'circle',
        source: 'regions',
        paint: {
            'circle-color': '#ff0000',
            'circle-radius': 9,
            'circle-stroke-width': 6,
            'circle-stroke-color': '#660000',
        },
    })
    addRegionPopup(map)
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

export function addClusteredRegions(map: mapboxgl.Map) {
    const manillaBayPoint: Feature = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [120.9749, 14.5547],
        },
        properties: {
            title: 'Manila Bay',
            description: 'Manila, Philippines',
        },
    }

    map.addSource('clusteredRegions', {
        type: 'geojson',
        data: manillaBayPoint,
    })

    map.addLayer({
        id: 'clusteredRegions',
        type: 'circle',
        source: 'clusteredRegions',
        paint: {
            'circle-color': '#ff0000',
            'circle-radius': 9,
            'circle-stroke-width': 6,
            'circle-stroke-color': '#660000',
        },
    })
    const popupContent: string = `<strong>Manilla Bay</strong><br>`
    addClusteredRegionPopup(map, popupContent)
}
