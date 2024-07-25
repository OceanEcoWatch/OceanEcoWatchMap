import mapboxgl from 'mapbox-gl'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { IDayOption } from '../../../interfaces/IDayOption'
import { AreaDetails } from '../../atoms/AreaDetails/AreaDetails'
import { BackButton } from '../../atoms/BackButton/BackButton'
import { ProbabilityLegend } from '../../atoms/ProbabilityLegend/ProbabilityLegend'
import DaySelect from '../../molecules/DaySelect/DaySelect'
import './OEWHeader.css'
import MapProjectionButton from '../../atoms/MapProjectionButton/MapProjectionButton'
import { IRegionData } from '../MapBoxMap/types'
import { ActionMeta } from 'react-select'

interface OEWHeaderProps {
    logo: string
    isOpen: boolean
    regionProps: null | IRegionData
    handleSelectedDaysChange: (event: ActionMeta<IDayOption>) => void
    handleDeselectAoi: () => void

    map: mapboxgl.Map
}

const OEWHeader: React.FC<OEWHeaderProps> = ({ logo, isOpen, regionProps, handleSelectedDaysChange, map, handleDeselectAoi }) => {
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
        regionProps.timestamps.forEach((timestamp, index) => {
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
                <div id="sidebar" className="flex flex-col items-center space-y-4">
                    {regionProps && (
                        <div className="container flex flex-col justify-between h-full">
                            <div>
                                <BackButton map={map} handleDeselectAoi={handleDeselectAoi}></BackButton>
                                <AreaDetails
                                    areaSize={regionProps.areaSize}
                                    firstAnalysis={regionProps.timestamps[0]}
                                    lastAnalysis={regionProps.timestamps[regionProps.timestamps.length - 1]}
                                    timestampsCount={regionProps.timestamps.length}
                                ></AreaDetails>
                                <div className="my-12">
                                    <div className="font-bold text-sm my-5 text-left">Select Days</div>
                                    {days.length > 0 && <DaySelect days={days} handleSelectedDaysChange={handleSelectedDaysChange} />}
                                </div>
                            </div>
                            <ProbabilityLegend></ProbabilityLegend>
                        </div>
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
                    <div id="info-div" className="absolute top-24 right-2 p-4">
                        <p className="text-start">
                            The <a href="https://www.oceanecowatch.org/">Ocean Eco Watch</a> is a map highliting potential locations of floating
                            marine debris. We use data from the sentinel-2 satellite. Click on a location to get the detailed analysis of the area.
                            Each point on the map corresponds to the probability of present marine debris and represents an area spanning 10 m².
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OEWHeader
