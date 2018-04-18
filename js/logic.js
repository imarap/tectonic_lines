var light = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");
var dark = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");
var mapstreet = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
"T6YbdDixkOBWH_k9GbS8JQ");

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var epicenters = [];
var earthquakes = [];
var tect_plates = [];
var heatarray = [];
d3.json(queryUrl, function(response) {
    //console.log(response);
    for (var i = 0; i < 1000; i++) { //response.length; i++) {
        var epic = {};
        var magnitude = response.features[i].properties.mag; 
        var latitude = response.features[i].geometry.coordinates[1];
        var longitude = response.features[i].geometry.coordinates[0];
        var depth = response.features[i].geometry.coordinates[2];
        var place = response.features[i].properties.place;
        var time = response.features[i].properties.time;
        var epic = { 
            "place": place,
            "location": [latitude, longitude],
            "magnitude": magnitude,
            "depth": depth,
            "time": time
        };
        epicenters.push(epic);
        //console.log("location:"+ epicenters[i].location[0] + ", " + epicenters[i].location[1] + 
        //            " magnitude:"+ epicenters[i].magnitude);
        heatarray.push([latitude, longitude, magnitude*1000]);
    };
    //
    //
    for (var i=0; i < epicenters.length; i++) {
        var earthquake = L.circle(epicenters[i].location, {
            fillOpacity: 0.75,
            fillColor: getColor(epicenters[i].magnitude), 
            color: "grey",
            weight: 1,
            className: "epicenter",
        // Setting our circle's radius equal to the output of our markerSize function
        // This will make our marker's size proportionate to its population
            radius: markerSize(epicenters[i].magnitude)
        }).bindPopup("<h3>Place:" + epicenters[i].place + 
            "</h3> <hr> <h4>Magnitude: " + epicenters[i].magnitude + 
            "<br/>Depth: "+ epicenters[i].depth +
            " km</h4>"); 
        earthquakes.push(earthquake);
    };
    //
    var tplates_Url = '/data/PB2002_p.json';
    d3.json(tplates_Url, function(plates) {
        console.log("Plates:");
        console.log(plates.geometry.coordinates["0"]);
        var parray = plates.geometry.coordinates["0"];
        for (var i=0; i < parray.length; i++){
            var plat = parray[i][1];
            var plon = parray[i][0];
            //console.log("Lat y Long: " + plat + "," + plon);
            tect_plates.push([plat, plon]);
        };
        //console.log("Tect Plates:");
        //console.log(tect_plates);
        var plinesLayer = L.polyline(tect_plates, {
            color: "orange",
            weight: 3
        }); 
        var earthquakeLayer = L.layerGroup(earthquakes);
        var myMap = L.map("map", {
            center: [45.52, -122.67],
            zoom: 4,
            layers: [light, earthquakeLayer]
        });
        var heatArrLayer = L.heatLayer(heatarray, {
            radius: 15,
            blur: 15
        });
        var overlaybase ={
            Satellite: light,
            Dark: dark,
            Outdoors: mapstreet
        };
        var overlayLayers = {
            Earthquakes: earthquakeLayer,
            Fault_Lines: plinesLayer,
            Heat_map: heatArrLayer
        };
        L.control
        .layers(overlaybase, overlayLayers)
        .addTo(myMap);
    
    // Add Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 3, 4, 5],
                labels = [];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
    });
    
});
//
function markerSize(magnitude) {
    return magnitude*20000;
};
// Create a six-color scale
var getColor = d3.scaleLinear()
     .domain([
         0.01, 1.0, 2.0, 3.0, 4.0, 5.0 
     ])
     .range([
        'limegreen','green','yellow','orange','pink','tomato'
     ]);

// Adding event handling with d3
d3.selectAll('.epicenter').on('mouseover', function(){
    d3.select(this).attr('stroke', 'red');
});
d3.selectAll('.epicenter').on('mouseout', function(){
    d3.select(this).attr('stroke', 'none');
});
