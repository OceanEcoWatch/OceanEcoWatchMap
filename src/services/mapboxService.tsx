import { FeatureCollection, GeoJsonProperties, Point, Polygon, Position } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { getJobPredictions } from './mapService'

// todo cleanup, split into multiple services => region, predictions, jobs??
export function getGlobeMap(mapContainerRef: React.RefObject<HTMLDivElement>) {
    return new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [120.825223033, 14.642099128],
        zoom: 2,
        projection: {
            name: 'globe',
        },
    })
}

export function loadStyles(map: mapboxgl.Map) {
    map.on('style.load', () => {
        map.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(30, 82, 203)',
            'horizon-blend': 0.01,
            'space-color': 'rgb(0, 0, 0)',
            'star-intensity': 0.5,
        })
    })
}

export function addNavigationControls(map: mapboxgl.Map) {
    var nav = new mapboxgl.NavigationControl()
    map.addControl(nav, 'bottom-right')
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

export function addPolygonLayer(map: mapboxgl.Map, aoi: Polygon) {
    map.addSource('polygon-source', {
        type: 'geojson',
        data: aoi,
    })

    map.addLayer({
        id: 'polygon-layer',
        type: 'line',
        source: 'polygon-source',
        layout: {},
        paint: {
            'line-color': '#660000',
            'line-width': 4,
        },
    })
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
            const description = `<strong>${name}</strong><br>Size of the region: ${area}km<sup>2</sup>`

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

export function addPredictionLayer(map: mapboxgl.Map, datetime: number, regionId: number) {
    getJobPredictions(datetime, regionId).then((predictions) => {
        map.addSource(`pred-${datetime}`, {
            type: 'geojson',
            data: predictions,
        })

        map.addLayer({
            id: `pred-${datetime}`,
            type: 'circle',
            source: `pred-${datetime}`,
            paint: {
                'circle-radius': 10,
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'prob'],
                    1,
                    '#ffffb2',
                    25,
                    '#fecc5c',
                    50,
                    '#fd8d3c',
                    75,
                    '#f03b20',
                    100,
                    '#bd0026',
                ],
            },
        })

        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
        })

        map.on('mouseenter', `pred-${datetime}`, function (e) {
            map.getCanvas().style.cursor = 'pointer'

            if (e.features![0].geometry.type === 'Point') {
                var coordinates = e.features![0].geometry.coordinates.slice()
                var description = `20.02.2023<br>
                               ${e.features![0].properties?.prob} %`

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
                }

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat([coordinates[0], coordinates[1]]).setHTML(description).addTo(map)
            }
        })

        map.on('mouseleave', `pred-${datetime}`, function () {
            map.getCanvas().style.cursor = ''
            popup.remove()
        })
    })
}

export function getBoundingBox(polygon: Polygon): [number, number, number, number] {
    const coordinates: Position[] = polygon.coordinates.flat(1)

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (const [x, y] of coordinates) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
    }

    return [minX, minY, maxX, maxY]
}
