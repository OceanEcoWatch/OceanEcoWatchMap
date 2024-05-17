import './AreaDetails.css'

export const AreaDetails: React.FC = () => (
    <div className="text-center text-sm">
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>Size of the area:</p>
                    </td>

                    <td>
                        <p>100km^2</p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p>First analysis:</p>
                    </td>
                    <td>
                        <p>24.07.2024</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Last analysis:</p>
                    </td>
                    <td>
                        <p>25.07.2000</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Amount of timestamps:</p>
                    </td>
                    <td>100</td>
                </tr>
            </tbody>
        </table>
    </div>
)
