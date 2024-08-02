import React, { useEffect } from 'react'
import Select, { MultiValue } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'

interface DaySelectProps {
    possibleDays: IDayOption[]
    selectedDays: readonly IDayOption[]
    setSelectedDays: React.Dispatch<React.SetStateAction<readonly IDayOption[]>>
}

const DaySelect: React.FC<DaySelectProps> = ({ possibleDays, selectedDays, setSelectedDays }) => {
    const [isDefaultSet, setIsDefaultSet] = React.useState(false)
    const handleChange = (selectedOptions: MultiValue<IDayOption>) => {
        setSelectedDays(selectedOptions)
    }

    useEffect(() => {
        if (possibleDays.length > 0 && !isDefaultSet) {
            setIsDefaultSet(true)
            setSelectedDays([possibleDays[0]])
        }
    }, [possibleDays, isDefaultSet, setSelectedDays])

    return (
        <Select
            value={selectedDays}
            isMulti
            name="days"
            options={possibleDays}
            className="basic-multi-select"
            onChange={handleChange}
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
                }),
            }}
        />
    )
}

export default DaySelect
