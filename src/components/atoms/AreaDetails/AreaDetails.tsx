import moment from 'moment'
import './AreaDetails.css'

interface AreaDetailsProps {
    areaSize: number
    firstAnalysis: number
    lastAnalysis: number
    timestampsCount: number
    timestampWithSignificantPlastic: number | string // can be "no data"
}

export const AreaDetails: React.FC<AreaDetailsProps> = ({
    areaSize,
    firstAnalysis,
    lastAnalysis,
    timestampsCount,
    timestampWithSignificantPlastic,
}) => {
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
                        <td>{timestampsCount}</td>
                    </tr>
                    <tr>
                        <td>
                            <p>Days with very high likely hood of plastic:</p>
                        </td>
                        <td>{timestampWithSignificantPlastic}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
