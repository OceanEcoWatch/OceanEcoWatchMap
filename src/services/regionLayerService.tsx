import { FeatureCollection, GeoJsonProperties, Point, Polygon } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { IRegionData } from '../components/organisms/MapBoxMap/types'
import { time } from 'console'

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
): void {
    map.addSource('aoi-centers', {
        type: 'geojson',
        data: regions,
    })

    map.addLayer({
        id: 'aoi-centers',
        type: 'circle',
        source: 'aoi-centers',
        paint: {
            'circle-color': '#ff0000',
            'circle-radius': 9,
            'circle-stroke-width': 6,
            'circle-stroke-color': '#660000',
        },
    })
    addRegionPopup(map)
    map.on('click', 'aoi-centers', (e) => {
        const regionId = e.features![0].properties!.id
        const regionName = e.features![0].properties!.name
        const regionSize = e.features![0].properties!.area_km2
        const regionPolygon: Polygon = JSON.parse(e.features![0].properties!.polygon)
        stateSetter({
            id: regionId,
            timestamps: [],
            name: regionName,
            areaSize: regionSize,
            polygon: regionPolygon,
        })
    })
}
