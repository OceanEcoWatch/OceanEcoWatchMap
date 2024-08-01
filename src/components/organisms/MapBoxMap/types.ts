import { Polygon } from 'geojson'

export type AoiId = number | null

export interface IRegionData {
    id: number
    timestamps: number[]
    name: string
    areaSize: number
    polygon: Polygon
}

export type CurrentAoiMetaData = {
    timestampWithSignificantPlastic: number | string
}

// This enum maps the model names to the display names in the UI
export enum Model {
    'Marida' = 'Marine Debris Detector',
    'MariNext' = 'MariNext',
}
