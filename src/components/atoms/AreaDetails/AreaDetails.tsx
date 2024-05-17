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
                        <p>1994 km^2</p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p>First analysis:</p>
                    </td>
                    <td>
                        <p>01.02.2022</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Last analysis:</p>
                    </td>
                    <td>
                        <p>16.05.2024</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>Amount of timestamps:</p>
                    </td>
                    <td>40</td>
                </tr>
            </tbody>
        </table>
    </div>
)
