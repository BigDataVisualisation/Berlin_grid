var data = [];
var ready = false;
var someText = [];
var wordFreq = {};
var gridPoints = [];
var projection = null;



function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  projection = d3.geoMercator() //Projektionsart, Auflistung von Projektionen:https://github.com/d3/d3-geo#projections
    .center([13.40609199, 52.50991182]) //Kartenmittelpunkt
    .translate([width / 2, height / 2]) //Screen Position des Kartenmittelpunktes
    .scale(95000);

  d3.csv("Berlin.csv", function (d) {

    return {
      latitude: +d.latitude,
      longitude: +d.longitude,
      host_name: d.host_name,
      room_type: d.room_type
    };
  }).then(function (csv) {
    data = csv;

    gridPoints = calcGridPoints(data, 0.005);
    console.log('gridPoints');
    console.log(gridPoints);
    ready = true;


    var textArray = d3.set(data, function (d) {
      return d.host_name;
    }).values();

    someText = textArray.join(" ");

    console.log(someText);

    wordFreq = wordFreqency(someText);
    console.log(wordFreq);

    let maxCount = d3.max(data, function (d) {
      return d.host_name;
    });

    redraw();
  });

  // var someText = d3.set(data, function(d){
  //   return d.host_name;
  // }).values();
  //
  // console.log(someText);
  //
  // wordFreq = wordFreqency(someText);
  // console.log(wordFreq);
  //
  // let maxCount = d3.max(data,function(d){
  //   return d.host_name;
  // });
}

function draw() {
  if (!ready) {
    background(255, 0, 0);
    return;
  } else {
    background(255);
  }


  //  text(someText, 20, 30, width - 20);


  // for (var i = 0; i < data.length; i++) {
  //   var d = data[i];
  //   var x = map(d.longitude, 13.7576419930298, 13.1035567479717, 800, 0) +150;
  //   var y = map(d.latitude, 52.6617767744425, 52.3458030847542, 800, 0) +60;
  //
  //   y = y + 20;
  //
  //   ellipse(x, y, 8, 8);
  // }

  //   for (var i = 0; i < data.length; i++) {
  //   var lon = data[i].longitude;
  //   var lat = data[i].latitude;
  //   var pos = projection([lon, lat]);
  //   ellipse(pos[0], pos[1], 2, 2);
  // }


  var maxCount = d3.max(gridPoints, function (d) {
    return d.count;
  });
  var rScale = d3.scaleSqrt()
    .domain([0, maxCount])
    .range([0, 6]);

  for (var i = 0; i < gridPoints.length; i++) {
    var lon = gridPoints[i].lon;
    var lat = gridPoints[i].lat;
    var pos = projection([lon, lat]);
    var r = rScale(gridPoints[i].count);
    fill(0);
    noStroke();
    ellipse(pos[0], pos[1], r, r);
  }

  var keys = Object.keys(wordFreq);

  var selectedKeys = keys.filter(function (k) {
    return wordFreq[k] > 5;
  });

  console.log(selectedKeys);


  var startY = 150;
  var lineHeight = 15;
  for (var i = 0; i < selectedKeys.length; i++) {
    var key = selectedKeys[i];
    console.log("key: " + key);
    var y = startY + i * lineHeight;
    text(key + ': ' + wordFreq[key], 20, y); //   text(key + ': ' + wordFreq[key], 20, y);
  }

  //saveCanvas('can','png');

}

function wordFreqency(string) {
  var words = string.replace(/[.]/g, '').split(/\s/);
  var freqMap = {};
  words.forEach(function (w) {
    if ((/\w{2,}/.test(w))) {
      if (!freqMap[w]) {
        freqMap[w] = 0;
      }
      freqMap[w] += 1;
    }
  });

  return freqMap;
}

function calcGridPoints(arr, cellSize) {

  var grid = [];

  let minLat = d3.min(arr, function (d) {
    return d.latitude;
  });
  let maxLat = d3.max(arr, function (d) {
    return d.latitude;
  });
  let minLon = d3.min(arr, function (d) {
    return d.longitude;
  });
  let maxLon = d3.max(arr, function (d) {
    return d.longitude;
  });

  //cellSize = (maxLon - minLon)/5;
  console.log('cellSize');
  console.log(cellSize);

  //create the grid points
  for (var lat = minLat; lat < maxLat; lat += cellSize) {
    for (var lon = minLon; lon < maxLon; lon += cellSize) {
      var centerLat = lat + 0.5 * cellSize;
      var centerLon = lon + 0.5 * cellSize;

      var pt = {
        lon: centerLon,
        lat: centerLat,
        count: 0
      };
      grid.push(pt);
    }
  }

  //calc grid values
  for (var i = 0; i < arr.length; i++) {
    var d = arr[i];
    var found = false;
    for (var gridIndex = 0; gridIndex < grid.length && !found; gridIndex++) {
      var gridPoint = grid[gridIndex];
      var bounds = calcBounds(gridPoint, cellSize);
      if (d.longitude > bounds.left && d.longitude < bounds.right && d.latitude > bounds.bottom && d.latitude < bounds.top) {
        found = true;
        gridPoint.count++;
      }
    }
  }

  return grid;

}

function calcBounds(pt, s) {
  return {
    left: pt.lon - 0.5 * s,
    right: pt.lon + 0.5 * s,
    top: pt.lat + 0.5 * s,
    bottom: pt.lat - 0.5 * s
  };
}
