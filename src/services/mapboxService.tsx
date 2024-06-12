import mapboxgl from 'mapbox-gl'

export function getGlobeMap(mapContainerRef: React.RefObject<HTMLDivElement>) {
    return new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [120.825223033, 14.642099128],
        zoom: 12,
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

export function initMap(mapContainerRef: React.RefObject<HTMLDivElement>, setMapLoaded: React.Dispatch<React.SetStateAction<boolean>>) {
    const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [120.825223033, 14.642099128],
        zoom: 2,
        projection: {
            name: 'mercator',
        },
    })

    map.on('style.load', () => {
        map.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(30, 82, 203)',
            'horizon-blend': 0.01,
            'space-color': 'rgb(0, 0, 0)',
            'star-intensity': 0.5,
        })

        setMapLoaded(true)
    })

    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav, 'bottom-right')

    return map
}
