import { Polygon } from 'geojson'

export interface IAOICenterProperties {
    id: number
    name: string
    area_km2: number
    polygon: Polygon
}
