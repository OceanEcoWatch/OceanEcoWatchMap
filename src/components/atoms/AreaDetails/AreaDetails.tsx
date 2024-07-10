import './AreaDetails.css'
import { IRegionData } from '../../organisms/MapBoxMap/types'
import { getReadableDateFromUnixTimestamp } from '../../../common/utils'

type AreaDetailsProps = Pick<IRegionData, 'areaSize' | 'numberOfTimestampsWithPlastic' | 'startDate' | 'endDate' | 'timestamps'>

export const AreaDetails: React.FC<AreaDetailsProps> = ({ areaSize, startDate, endDate, timestamps, numberOfTimestampsWithPlastic }) => {
    const numberOfDays = timestamps.length
    return (
        <div className="text-center text-sm">
            <table>
                <tbody>
                    <tr>
                        <td>
                            <p>Size of the region:</p>
                        </td>

                        <td>
                            <p>{areaSize.toFixed(2)} km&sup2;</p>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <p>First analysis:</p>
                        </td>
                        <td>
                            <p>{getReadableDateFromUnixTimestamp(startDate)}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Last analysis:</p>
                        </td>
                        <td>
                            <p>{getReadableDateFromUnixTimestamp(endDate)}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Amount of days:</p>
                        </td>
                        <td>{numberOfDays}</td>
                    </tr>
                    <tr>
                        <td>
                            <p>Days without high likely hood of plastic:</p>
                        </td>
                        <td>{numberOfDays - numberOfTimestampsWithPlastic}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
