import React, { useEffect, useState } from 'react';

function PacketsDisplay(props) {
    const [packet, setPacket] = useState([]);

    useEffect(() => {
        setPacket(props.data);
        console.log(props.data[0]?._source.layers);
    }, [props.data])
    return (
        <div>
            <table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <td>Timestamp</td>
                        <td>Source IP</td>
                        <td>Destination IP</td>
                        <td>Source Port</td>
                        <td>Destination Port</td>
                        <td>Protocol </td>
                        <td>Packet Length</td>
                        <td>Header Length</td>
                        <td>Flow Bytes/s</td>


                    </tr>
                </thead>
                <tbody>
                    {
                        // console.log(props.data[0]?.packet)
                        //console.log(JSON.parse(props.data[0]?.packet))
                        packet != undefined ?
                            packet.map((element, index) =>
                                <tr style={{ backgroundColor: index % 2 == 0 ? "rgba(0,186,255,0.2)" : "" }}>
                                    <td>{element?._index}</td>
                                    <td>{element?._source?.layers?.["ip.src"]}</td>
                                    <td>{element?._source?.layers?.["ip.dst"]}</td>
                                    <td>{element?._source?.layers?.["tcp.srcport"]}</td>
                                    <td>{element?._source?.layers?.["tcp.dstport"]}</td>
                                    <td>{element?._source?.layers?.["ip.proto"]}</td>
                                    <td>{Object.keys(element).length}</td>
                                    <td>{element?._source?.layers?.["ip.hdr_len"]}</td>
                                    <td>Packet Count {index}</td>
                                    {/* <td>Frame len </td>
                                    <td>Flow Bytes/s</td> */}
                                    
                                </tr>
                            )
                            : null
                    }
                </tbody>
            </table>

        </div>
    );
}

export default PacketsDisplay;