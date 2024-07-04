import { FeatureCollection, Point, Polygon, Position } from 'geojson'
import mapboxgl from 'mapbox-gl'
import moment from 'moment'
import { colorCoding } from '../common/utils'
import { IPredProperties } from '../interfaces/api/IPredProperties'

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

export function addPredictionLayer(
    map: mapboxgl.Map,
    datetime: number,
    aoiId: number,
    predictionQueryData: FeatureCollection<Point, IPredProperties>,
) {
    map.addSource(`prediction-${datetime}-${aoiId}`, {
        type: 'geojson',
        data: predictionQueryData,
    })

    map.addLayer({
        id: `prediction-${datetime}-${aoiId}-heatmap`,
        type: 'heatmap',
        source: `prediction-${datetime}-${aoiId}`,
        maxzoom: 15,
        paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'pixelValue'], 0, 0, 100, 1],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 15],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(255, 237, 160, 0)',
                0.1,
                colorCoding[10],
                0.2,
                colorCoding[20],
                0.3,
                colorCoding[30],
                0.4,
                colorCoding[40],
                0.5,
                colorCoding[50],
                0.6,
                colorCoding[60],
                0.7,
                colorCoding[70],
                0.8,
                colorCoding[80],
                0.9,
                colorCoding[90],
                1,
                colorCoding[100],
            ],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 3, 15, 3],
        },
    })

    map.addLayer({
        id: `prediction-${datetime}-${aoiId}-point`,
        type: 'circle',
        source: `prediction-${datetime}-${aoiId}`,
        minzoom: 14,
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 5, 22, 10],
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

    map.on('mouseenter', `prediction-${datetime}-${aoiId}-point`, function (e) {
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

    map.on('mouseleave', `prediction-${datetime}-${aoiId}-point`, function () {
        map.getCanvas().style.cursor = ''
        popup.remove()
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

export function removePredictionById(map: mapboxgl.Map, datetime: number, aoiId: number) {
    const layerId = `prediction-${datetime}-${aoiId}`
    const sourceId = `prediction-${datetime}-${aoiId}`

    map.removeLayer(layerId)
    map.removeSource(sourceId)
}

export function removeAllPredictions(map: mapboxgl.Map) {
    const layers = map.getStyle().layers
    layers.forEach((layer) => {
        if (layer.id.startsWith('prediction')) {
            console.log('removing layer', layer.id)
            map.removeLayer(layer.id)
        }
    })

    const sources = map.getStyle().sources
    Object.keys(sources).forEach((sourceId) => {
        if (sourceId.startsWith('prediction')) {
            map.removeSource(sourceId)
        }
    })
}
