import { Polygon, Position } from 'geojson'
import mapboxgl from 'mapbox-gl'
import moment from 'moment'
import { colorCoding } from '../common/utils'
import { getJobPredictions } from './mapService'

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
export async function addPredictionLayer(map: mapboxgl.Map, datetime: number | undefined, regionId: number | undefined): Promise<any> {
    if (!datetime || !regionId) {
        console.error('Datetime', datetime)
        console.error('RegionId', regionId)
        return []
    }

    //timout to simulate loading
    //await new Promise((resolve) => setTimeout(resolve, 1000))

    const predictions = await getJobPredictions(datetime, regionId)

    //check if source already exists
    if (map.getSource(`pred-${datetime}:${regionId}`)) {
        map.removeLayer(`pred-${datetime}:${regionId}`)
        map.removeSource(`pred-${datetime}:${regionId}`)
    }

    map.addSource(`pred-${datetime}:${regionId}`, {
        type: 'geojson',
        data: predictions,
    })

    map.addLayer({
        id: `pred-${datetime}:${regionId}`,
        type: 'circle',
        source: `pred-${datetime}:${regionId}`,
        paint: {
            'circle-radius': 10,
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'pixelValue'],
                10,
                colorCoding[10],
                20,
                colorCoding[20],
                30,
                colorCoding[30],
                40,
                colorCoding[40],
                50,
                colorCoding[50],
                60,
                colorCoding[60],
                70,
                colorCoding[70],
                80,
                colorCoding[80],
                90,
                colorCoding[90],
                100,
                colorCoding[100],
            ],
        },
    })

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
    })

    map.on('mouseenter', `pred-${datetime}:${regionId}`, function (e) {
        map.getCanvas().style.cursor = 'pointer'

        if (e.features![0].geometry.type === 'Point') {
            var coordinates = e.features![0].geometry.coordinates.slice()
            var description = `${moment.unix(datetime).format('DD.MM.YYYY HH:mm')}<br>
                           ${e.features![0].properties?.pixelValue.toFixed(0)} %`

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

    map.on('mouseleave', `pred-${datetime}:${regionId}`, function () {
        map.getCanvas().style.cursor = ''
        popup.remove()
    })

    return predictions
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
