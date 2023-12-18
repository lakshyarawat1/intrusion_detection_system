import React, { useEffect, useRef } from 'react';

function MapComponent(props) {
    const mapRef = useRef();

    useEffect(() => {
       
            const timeoutId = setTimeout(() => {
                if (!mapRef.current) {
                    mapRef.current = new Microsoft.Maps.Map('#myMap', {
                        credentials: 'AqmMCLIWT1bscFxQEkTdhlDJX436f-R9zIj4Rvq5TkFzh5sVC0uJBpfzDoPS_s6a',
                        center: new Microsoft.Maps.Location(28.652, 77.1663), // Default center (Delhi)
                        zoom: 3 // Default zoom level
                    });
    
                    // Apply custom theme directly to the map instance
                    var customStyle = {
                        elements: {
                            area: { fillColor: '#B0E57C' },
                            water: { fillColor: 'red' },
                            tollRoad: { fillColor: '#A964A4' }
                            // Add more styling options as needed
                        }
                    };
                    mapRef.current.setOptions({ customMapStyle: customStyle });
     
                    // Set map type to aerial
                    mapRef.current.setMapType(Microsoft.Maps.MapTypeId.aerial);
                }
            }, 1000); // Delay initialization by 1 second
    
            return () => clearTimeout(timeoutId);
       
    }, []);

    return (
        <>
            <div id="myMap" style={{ position: "relative", width: "100%", height: "45vh" }}></div>
          
        </>
    );
}

export default MapComponent;
