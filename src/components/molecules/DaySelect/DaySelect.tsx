import React from 'react'
import Select, { ActionMeta } from 'react-select'
import { IDayOption } from '../../../interfaces/IDayOption'

interface DaySelectProps {
    days: IDayOption[]
    handleSelectedDaysChange: (event: ActionMeta<IDayOption>) => void
}

const DaySelect: React.FC<DaySelectProps> = ({ days, handleSelectedDaysChange }) => {
    return (
        <Select
            defaultValue={days[0]}
            isMulti
            name="days"
            options={days}
            className="basic-multi-select"
            onChange={(_, action) => handleSelectedDaysChange(action)}
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
