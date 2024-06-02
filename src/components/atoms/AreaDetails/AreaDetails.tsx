import moment from 'moment'
import './AreaDetails.css'

interface AreaDetailsProps {
    areaSize: number
    firstAnalysis: number
    lastAnalysis: number
    timestampsCount: number
}

export const AreaDetails: React.FC<AreaDetailsProps> = ({ areaSize, firstAnalysis, lastAnalysis, timestampsCount: timestepsCount }) => {
    return (
        <div className="text-center text-sm">
            <table>
                <tbody>
                    <tr>
                        <td>
                            <p>asd</p>
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
                            <p>{moment.unix(firstAnalysis).format('DD.MM.YYYY')}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Last analysis:</p>
                        </td>
                        <td>
                            <p>{moment.unix(lastAnalysis).format('DD.MM.YYYY')}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Amount of timestamps:</p>
                        </td>
                        <td>{timestepsCount}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
