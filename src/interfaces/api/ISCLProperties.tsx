export interface ISCLProperties {
    classification: 'CLOUD_HIGH_PROB'
    image_id: 35
    timestamp: '2023-06-26T02:33:41'
    aoi_id: 1
}

export enum SCL_INT {
    NO_DATA = 0,
    SATURATED = 1,
    SHADOWS = 2,
    CLOUD_SHADOWS = 3,
    VEGETATION = 4,
    NOT_VEGETATED = 5,
    WATER = 6,
    UNCLASSIFIED = 7,
    CLOUD_MEDIUM_PROB = 8,
    CLOUD_HIGH_PROB = 9,
    THIN_CIRRUS = 10,
    SNOW_ICE = 11,
}

export enum SCL_STRING {
    NO_DATA = 'NO_DATA',
    SATURATED = 'SATURATED',
    SHADOWS = 'SHADOWS',
    CLOUD_SHADOWS = 'CLOUD_SHADOWS',
    VEGETATION = 'VEGETATION',
    NOT_VEGETATED = 'NOT_VEGETATED',
    WATER = 'WATER',
    UNCLASSIFIED = 'UNCLASSIFIED',
    CLOUD_MEDIUM_PROB = 'CLOUD_MEDIUM_PROB',
    CLOUD_HIGH_PROB = 'CLOUD_HIGH_PROB',
    THIN_CIRRUS = 'THIN_CIRRUS',
    SNOW_ICE = 'SNOW_ICE',
}

export enum SCL_NAME {
    'NO_DATA' = 'NO_DATA',
    'SATURATED' = 'Defective pixels',
    'SHADOWS' = 'Shadows',
    'CLOUD_SHADOWS' = 'Cloud shadows',
    'VEGETATION' = 'Vegetation',
    'NOT_VEGETATED' = 'Not-vegetated',
    'WATER' = 'Water',
    'UNCLASSIFIED' = 'Unclassified',
    'CLOUD_MEDIUM_PROB' = 'Clouds (medium probability)',
    'CLOUD_HIGH_PROB' = 'Clouds (high probability)',
    'THIN_CIRRUS' = 'Thin cirrus clouds',
    'SNOW_ICE' = 'Snow or Ice',
}

export enum SCL_COLOR {
    'NO_DATA' = '#390099',
    'SATURATED' = '#9e0059',
    'SHADOWS' = '#ff0054',
    'CLOUD_SHADOWS' = '#ff5400',
    'VEGETATION' = '#ffbd00',
    'NOT_VEGETATED' = '#ffcdb2',
    'WATER' = '#b5838d',
    'UNCLASSIFIED' = '#4f772d',
    'CLOUD_MEDIUM_PROB' = '#FF4500',
    'CLOUD_HIGH_PROB' = '#1b9aaa',
    'THIN_CIRRUS' = '#00FF00',
    'SNOW_ICE' = '#a8a8d4',
}
