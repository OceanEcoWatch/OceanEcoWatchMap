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

// Create a single, reusable popup instance
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
})

export function addPredictionLayer(
    map: mapboxgl.Map,
    aoiId: number,
    currentPredictions: FeatureCollection<Point, IPredProperties>,
    showPixelValue: boolean = true,
) {
    const layerId = `prediction-${aoiId}`
    const heatmapLayerId = `${layerId}-heatmap`
    const pointLayerId = `${layerId}-point`

    // Remove existing layers and source if they exist
    if (map.getLayer(heatmapLayerId)) map.removeLayer(heatmapLayerId)
    if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId)
    if (map.getSource(layerId)) map.removeSource(layerId)

    // Remove existing event listeners
    map.off('mouseenter', pointLayerId as any)
    map.off('mouseleave', pointLayerId as any)

    // Add new source and layers
    map.addSource(layerId, {
        type: 'geojson',
        data: currentPredictions,
    })

    map.addLayer({
        id: heatmapLayerId,
        type: 'heatmap',
        source: layerId,
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
        id: pointLayerId,
        type: 'circle',
        source: layerId,
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

    map.on('mouseenter', pointLayerId, (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (e.features && e.features[0].geometry.type === 'Point') {
            const coordinates = e.features[0].geometry.coordinates.slice() as [number, number]
            let description = `${moment.unix(e.features[0].properties!.timestamp).format('DD.MM.YYYY HH:mm')}`
            if (showPixelValue)
                description += `<br>
                           ${e.features[0].properties?.pixelValue.toFixed(0)} %`

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map)
        }
    })

    map.on('mouseleave', pointLayerId, () => {
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

export function removeAllPredictions(map: mapboxgl.Map) {
    const mapStyle = map.getStyle()
    if (mapStyle.layers) {
        const layers = mapStyle.layers
        layers.forEach((layer) => {
            if (layer.id.startsWith('prediction')) {
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
}
