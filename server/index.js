var express = require("express");
const app = express();
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { performance } = require("perf_hooks");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const os = require("os");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const corss = require("cors");
app.use(corss());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
function execute_TSHARK(callback) {
  let packetCount = 0;
  let lastTime = performance.now();
  const tSharkScript = exec(
    `C:/"Program Files"/Wireshark/tshark.exe -i Wi-Fi -w output_capture_file.pcap  -Tjson -e frame.time -e ip.src -e ip.dst -e tcp.srcport -e tcp.dstport -e ip.proto -e frame.len -e ip.hdr_len -e tcp.analysis.bytes_in_flight`
  );

  tSharkScript.stdout.on("data", (data) => {
    packetCount++;

    // Calculate the time since the last packet
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastTime;

    // Update the last time
    lastTime = currentTime;

    // Calculate and log the packet frequency
    const frequency = packetCount / (elapsedTime / 1000); // packets per second
    // console.log(`Packet Frequency: ${frequency.toFixed(2)} packets/second`);
    // console.log(datata)
    // console.log(chunk)
    var exportData = {
      packet: data,
      frequency: frequency.toFixed(2),
    };
    // console.log(exportData)
    io.on("connection", (socket) => {
      // console.log("connected")
      socket.broadcast.emit("exportData", exportData);
    });
    callback(exportData);
  });

  tSharkScript.stderr.on("data", (data) => {
    console.error(`error: ${data}`);
  });

  tSharkScript.on("close", (code) => {
    console.log(`close: ${code}`);
  });
}

function read_TSHARK(callback) {
  const tSharkScript = exec(
    `C:/"Program Files"/Wireshark/tshark.exe -r output_capture_file.pcap -Tjson -e frame.time -e ip.src -e ip.dst -e tcp.srcport -e tcp.dstport -e ip.proto -e frame.len -e ip.hdr_len -e tcp.analysis.bytes_in_flight > output.txt`
  );

  tSharkScript.stdout.on("data", (data) => {
    // console.log(`output: ${data}`);
  });

  tSharkScript.stderr.on("data", (data) => {
    console.error(`error: ${data}`);
  });

  tSharkScript.on("close", (code) => {
    console.log(`close: ${code}`);
  });
}

function delayedRead() {
  return new Promise((resolve, reject) => {
    let accumulatedData = "";
    const readStream = fs.createReadStream("output.txt", "utf8");

    // Set up event listeners for the stream
    readStream.on("data", (chunk) => {
      accumulatedData += chunk;
      // Simulate a 1000ms delay before processing the chunk
      setTimeout(() => {
        processData(accumulatedData);
        accumulatedData = ""; // Clear accumulated data after processing
      }, 1000);
    });

    readStream.on("end", () => {
      if (accumulatedData.length > 0) {
        processData(accumulatedData);
        console.log("yo yo");
      } else {
        // accumulatedData = ""
        readStream.close();
        delayedRead();
      }

      console.log("End of file reached.");
      resolve(accumulatedData); // Resolve the promise with the accumulated data
    });

    readStream.on("error", (err) => {
      console.error(`Error reading the file: ${err.message}`);
      reject(err); // Reject the promise if there's an error
    });
  });
}

function processData(data) {
  // console.log('Received data:', data);
  try {
    const jsonData = JSON.parse(data);
    // console.log('Parsed JSON data:', jsonData);
    // Here you can send jsonData to the client using WebSocket or any other method
  } catch (error) {
    console.error("Error parsing JSON:", error.message);
    // accumulatedData = ""
    // readStream.close();

    // delayedRead();
  }
}

// Create a read stream

// Call the delayedRead function with a 1000 of 1000 milliseconds (1 second)

function getCpuUtilization() {
  const cpus = os.cpus();
  const totalCpuTime = cpus.reduce(
    (acc, cpu) =>
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq,
    0
  );
  const idleCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);

  const cpuUtilization = 100 - (idleCpuTime / totalCpuTime) * 100;
  return cpuUtilization.toFixed(2);
}

function getRamUtilization() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const ramUtilization = (usedMemory / totalMemory) * 100;
  return ramUtilization.toFixed(2);
}

// Example usage
setInterval(() => {
  const cpuUtilization = getCpuUtilization();
  const ramUtilization = getRamUtilization();
  const resourceUtilization = {
    cpu: cpuUtilization,
    ram: ramUtilization,
  };
  // console.log(cpuUtilization,ramUtilization)
  io.on("connection", (socket) => {
    // console.log("connected")
    socket.broadcast.emit("utilization", resourceUtilization);
  });
}, 1000);

execute_TSHARK((data) => {
  // Event listener for WebSocket connections
});

read_TSHARK((data) => {
  // Event listener for WebSocket connections
});

app.get("/getData", async (req, res) => {
  try {
    const data = await delayedRead();
    // Send the processed data to the client
    // console.log(data)
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error reading the file" });
  }
});

server.listen(3001, () => {
  console.log("running");
});
