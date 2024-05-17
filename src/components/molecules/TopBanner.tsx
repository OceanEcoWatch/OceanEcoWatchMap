import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { RegionProperties } from '../../interfaces/Aoi'
import { AreaDetails } from '../atoms/AreaDetails/AreaDetails'
import { BackButton } from '../atoms/BackButton/BackButton'
import { ProbabilityLegend } from '../atoms/ProbabilityLegend/ProbabilityLegend'
import './TopBanner.css'

interface TopBannerProps {
    logo: string
    isOpen: boolean
    regionProps: undefined | RegionProperties
    handleSelectDays: (days: number[]) => void
}

export interface DayOption {
    readonly value: number
    readonly label: string
}

const TopBanner: React.FC<TopBannerProps> = ({ logo, isOpen, regionProps, handleSelectDays }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen)
    const [infoIsOpen, setInfo] = useState(false)

    const toggleInfo = () => setInfo(!infoIsOpen)
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    useEffect(() => {
        setIsSidebarOpen(isOpen)
    }, [isOpen])

    const days: DayOption[] = []

    const handleSelectedDaysChange = (selectedOptions: any) => {
        handleSelectDays(selectedOptions.map((dayOptionn: any) => dayOptionn.value))
    }

    if (regionProps) {
        regionProps.jobs.forEach((timestamp) => {
            const readableTimestamp = moment.unix(timestamp).format('DD.MM.YYYY HH:mm')
            days.push({ value: timestamp, label: readableTimestamp })
        })
    }

    return (
        <div id="header">
            <button
                onClick={toggleSidebar}
                className="absolute top-2 left-2 p-2 text-xl text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-md"
            >
                &#9776;
            </button>
            <div
                className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transform top-0 left-0 w-64 text-white fixed h-full transition-transform duration-300 ease-in-out z-10`}
            >
                <div className="p-5 text-base font-bold">{regionProps?.name}</div>
                <div id="sidebar" className="flex flex-col items-center space-y-4">
                    {regionProps !== undefined && (
                        <div className="container flex flex-col justify-between h-full">
                            <div>
                                <BackButton></BackButton>
                                <AreaDetails></AreaDetails>
                                <div className="my-12">
                                    <div className="font-bold text-sm my-5 text-left">Select Days</div>
                                    <Select
                                        defaultValue={days[0]}
                                        isMulti
                                        name="colors"
                                        options={days}
                                        className="basic-multi-select"
                                        onChange={handleSelectedDaysChange}
                                        classNamePrefix="select"
                                        theme={(theme) => ({
                                            ...theme,
                                            borderRadius: 0,
                                            colors: {
                                                ...theme.colors,
                                                primary25: '#3c404a',
                                                primary: 'black',
                                            },
                                        })}
                                        styles={{
                                            control: (baseStyles, state) => ({
                                                ...baseStyles,
                                                borderColor: 'white',
                                                borderRadius: '5px',
                                                backgroundColor: 'rgb(0,0,0,0.7)',
                                            }),
                                            container: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: 'black',
                                            }),
                                            multiValue: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: '#3c404a',
                                                borderRadius: '5px',
                                            }),
                                            indicatorsContainer: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: 'black',
                                            }),
                                            indicatorSeparator: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: 'white',
                                            }),
                                            menu: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: '#1f2937',
                                            }),
                                            menuList: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: 'rgb(0,0,0,0.8)',
                                            }),
                                            multiValueLabel: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: '#3c404a',
                                                borderRadius: '5px',
                                                color: 'white',
                                            }),
                                            multiValueRemove: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: '#1f2126',
                                                borderRadius: '5px',
                                                // hover color black?
                                            }),
                                        }}
                                    />
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
                <button
                    onClick={toggleInfo}
                    className="absolute top-2 right-2 p-3 w-12 h-12 text-xl text-white bg-gray-700 hover:bg-gray-900 focus:outline-none z-20 rounded-full"
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

export default TopBanner
