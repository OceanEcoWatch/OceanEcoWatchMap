import mapboxgl from 'mapbox-gl'
import { MapProjection } from '../components/organisms/MapBoxMap/MapboxMap'

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

export function toggleMapProjection(map: mapboxgl.Map, setCurrentMapProjection: (projection: MapProjection) => void) {
    const currentProjection = map.getProjection()
    if (currentProjection.name === 'globe') {
        map.setProjection('mercator')
        setCurrentMapProjection('flat')
    } else {
        map.setProjection('globe')
        setCurrentMapProjection('globe')
    }
}
