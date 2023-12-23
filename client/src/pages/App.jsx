import { useEffect, useState } from "react";
import "../App.css";
import MapComponent from "../components/MapComponent";
import axios from "axios";
import io from "socket.io-client";
import { FaLocationArrow, FaNetworkWired } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Col, Row } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import PacketsDisplay from "../components/packetsDisplay";
import RealTimeChart from "../components/chart";
import CpuUtilization from "../components/cpuutilization";
import RamUtilization from "../components/ramutilization";
import { getLocation } from "../utils/locationUtil";
import { toast } from "react-toastify";

function App() {
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [ip, setIp] = useState("");
  const [packets, setPackets] = useState([]);
  const [newPackets, setNewPackets] = useState([]);
  const [singlePacket, setSinglePacket] = useState([]);
  const [resourceUtilization, setResourceUtilization] = useState([]);

  const ENDPOINT = "http://localhost:3001";
  const socket = io.connect(ENDPOINT);

  const locationError = (err) =>
    toast(`Error getting location. Error : ${err.message}`);

  useEffect(() => {
    function setLocation() {
      getLocation()
        .then((coords) => {
          setLatitude(coords.latitude.toFixed(2));
          setLongitude(coords.longitude.toFixed(2));
        })
        .catch((err) => {
          locationError(err);
        });
    }
    setLocation();
  }, []);

  axios.get("https://api.ipify.org?format=json").then((resp) => {
    setIp(resp.data.ip);
  });

  useEffect(() => {
    // console.log(resp.data)
    socket.on("exportData", (args) => {
      // console.log(args.packet)
      setPackets((prevData) => {
        const newData = [...prevData, args];

        // Check if the number of packets exceeds 10
        if (newData.length > 5) {
          // Remove the oldest packet
          newData.shift();
        }

        return newData;
      });

      setSinglePacket(args);
    });

    socket.on("utilization", (args) => {
      // console.log(args);
      setResourceUtilization(args);
    });

    axios.get("http://localhost:3001/getData").then((resp) => {
      setNewPackets(JSON.parse(resp.data));
    });
  }, []);

  console.log(packets);

  return (
    <div className="maindiv">
      <div className="consolebox">
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
          }}
        >
          <>
            <FaNetworkWired />
            &nbsp;&nbsp;{ip}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
            <FaLocationArrow />
            &nbsp;&nbsp;
            {latitude}ºN , {longitude}ºE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input className="generalInput" placeholder="Port no" />
            &nbsp;&nbsp;&nbsp;
            <select className="dropdownSelect">
              <option>Ethernet eth0</option>
              <option>WIFI</option>
            </select>
          </>
          <ToastContainer
            draggable
            closeOnClick
            pauseOnFocusLoss
            hideProgressBar={false}
            autoClose={5000}
            rtl={false}
            theme="dark"
          />
        </div>
      </div>
      <MapComponent />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Row className="row" style={{ maxHeight: "40vh" }}>
          <Col lg="2" className="columns" style={{ padding: "15px" }}>
            Network Frequency&nbsp;&nbsp;&nbsp;{singlePacket.frequency}{" "}
            Packets/Sec
            <RealTimeChart data={singlePacket} />
            <br />
            CPU Utilization&nbsp;&nbsp;&nbsp;{resourceUtilization.cpu} %
            <CpuUtilization data={resourceUtilization} />
            <br />
            RAM Utilization&nbsp;&nbsp;&nbsp;{resourceUtilization.ram} %
            <RamUtilization data={resourceUtilization} />
          </Col>
          <Col lg="7" className="columns">
            <PacketsDisplay data={newPackets} />
          </Col>
          <Col lg="3" className="columns">
            {packets.reverse().map((element, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "rgba(0,186,255,0.2)" : "",
                }}
              >
                {element.packet}
              </div>
            ))}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
