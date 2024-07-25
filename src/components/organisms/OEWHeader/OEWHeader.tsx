import mapboxgl from 'mapbox-gl'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { ActionMeta } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'
import { AreaDetails } from '../../atoms/AreaDetails/AreaDetails'
import { BackButton } from '../../atoms/BackButton/BackButton'
import MapProjectionButton from '../../atoms/MapProjectionButton/MapProjectionButton'
import { ProbabilityLegend } from '../../atoms/ProbabilityLegend/ProbabilityLegend'
import DaySelect from '../../molecules/DaySelect/DaySelect'
import { IRegionData, CurrentAoiMetaData, AoiId } from '../MapBoxMap/types'
import './OEWHeader.css'
import { SCLInformationContainer } from '../../atoms/SceneClassification/SclContainer'
import { ProbabilityFilter } from '../../atoms/ProbabilityFilter/ProbabilityFilter'

interface OEWHeaderProps {
    logo: string
    isOpen: boolean
    regionProps: null | IRegionData
    handleSelectedDaysChange: (event: ActionMeta<IDayOption>) => void
    handleDeselectAoi: () => void
    currentAoiMetaData: CurrentAoiMetaData | null

    map: mapboxgl.Map
    isBusy: boolean
    uniqueSelectedTimestamps: number[]
}

const OEWHeader: React.FC<OEWHeaderProps> = ({
    logo,
    isOpen,
    regionProps,
    handleSelectedDaysChange,
    map,
    handleDeselectAoi,
    isBusy,
    currentAoiMetaData,
    uniqueSelectedTimestamps,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen)
    const [infoIsOpen, setInfo] = useState(false)

    const toggleInfo = () => setInfo(!infoIsOpen)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    useEffect(() => {
        setIsSidebarOpen(isOpen)
    }, [isOpen])

    const days: IDayOption[] = []

    if (regionProps) {
        regionProps.timestamps.forEach((timestamp) => {
            const readableTimestamp = moment.unix(timestamp).format('DD.MM.YYYY HH:mm')
            days.push({ value: timestamp, label: readableTimestamp })
        })
    }

    return (
        <div id="header">
            <button onClick={toggleSidebar} className="p-2 text-xl text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-md flex ">
                &#9776;
            </button>
            <div
                className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transform top-0 left-0 w-64 text-white fixed h-full transition-transform duration-300 ease-in-out z-10`}
            >
                <div className="p-5 text-base font-bold">{regionProps?.name}</div>
                <div id="sidebar" className="flex flex-col items-center justify-center h-full">
                    {regionProps === null && <p>Click on one of the red dots to select a region first.</p>}
                    {regionProps && (
                        <div className="container flex flex-col justify-between h-full">
                            <div>
                                <BackButton map={map} handleDeselectAoi={handleDeselectAoi}></BackButton>
                                <AreaDetails
                                    areaSize={regionProps.areaSize}
                                    firstAnalysis={regionProps.timestamps[0]}
                                    lastAnalysis={regionProps.timestamps[regionProps.timestamps.length - 1]}
                                    timestampsCount={regionProps.timestamps.length}
                                    timestampWithSignificantPlastic={currentAoiMetaData?.timestampWithSignificantPlastic}
                                ></AreaDetails>
                                <div className="my-12">
                                    <div className="font-bold text-sm my-5 text-left">Select Days</div>
                                    {days.length > 0 && <DaySelect isBusy={isBusy} days={days} handleSelectedDaysChange={handleSelectedDaysChange} />}
                                </div>
                            </div>
                            <ProbabilityFilter map={map} aoiId={regionProps.id}></ProbabilityFilter>
                            <ProbabilityLegend></ProbabilityLegend>
                        </div>
                    )}
                    {uniqueSelectedTimestamps && regionProps?.id && (
                        <SCLInformationContainer selectedTimestamps={uniqueSelectedTimestamps || []} currentAoiId={regionProps.id} map={map} />
                    )}
                </div>
            </div>

            <div className="text-center py-2 pl-16 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-12 inline-block mr-4" />
                <span className="text-xl font-semibold">Ocean Eco Watch</span>
            </div>

            <div className="flex  space-x-8">
                <MapProjectionButton map={map} />

                <button
                    onClick={toggleInfo}
                    className="p-3 w-12 h-12 text-xl text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-full"
                >
                    i
                </button>
                {infoIsOpen && (
                    <div id="info-div" className="absolute top-24 right-2 p-5">
                        <p className="text-start">
                            <a href="https://www.oceanecowatch.org/">Ocean Eco Watch</a> is an interactive map highlighting potential locations of
                            floating marine debris in various coastal areas. Utilizing data from the ESA's Sentinel-2 satellite, our map identifies
                            and analyzes debris hotspots.
                            <br></br>
                            To explore, click on any red dot and zoom in to see a detailed marine debris analysis of the area. Each point represents a
                            10m x 10m area with an estimated probability of marine debris presence.
                            <br></br>
                            We welcome your feedback and suggestions! If you enjoy this map or have ideas for new features or applications, please
                            contact us at: <a href="mailto:contact@oceanecowatch.org">contact@oceanecowatch.org</a>.<br></br>
                            As an open-source project, you can find and contribute to our source code on{' '}
                            <a href="https://github.com/OceanEcoWatch">GitHub</a>.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={toggleInfo}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm py-2 px-4 rounded shadow-lg"
                            >
                                close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OEWHeader
