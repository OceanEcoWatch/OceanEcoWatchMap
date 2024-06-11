import { Polygon } from 'geojson'

export function addAoiBboxLayer(map: mapboxgl.Map, bbox: Polygon) {
    console.log('bbox', bbox)
    map.addSource('aoi-bbox', {
        type: 'geojson',
        data: bbox,
    })

    map.addLayer({
        id: 'aoi-bbox-layer',
        type: 'line',
        source: 'aoi-bbox',
        paint: {
            'line-color': '#FF0000',
            'line-width': 2,
        },
    })
}

export function removeAoiBboxLayer(map: mapboxgl.Map) {
    map.removeLayer('aoi-bbox-layer')
    map.removeSource('aoi-bbox')
}
