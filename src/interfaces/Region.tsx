import { Polygon } from 'geojson'

export interface RegionProperties {
    id: number
    name: string
    area_km2: number
    polygon: Polygon
}
