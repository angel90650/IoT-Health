var dataBuffer = [];
var datetimeBuffer = [];
var timestampBuffer = [];
var timeDiffBuffer = [];
var zScoreTime = [];
var currentSensorIndexes = [];
var bufferSize = 50;
var nextDataItem = bufferSize;
var dataStart = 0;
var dataEnd = 0 + bufferSize;
var anomalyCount=0;
var sensitivity = 1.49;
var zScore = [];
var timezScore = [];
var dataChartCanvas = $("#dataChart");
var dataScoreChartCanvas = $("#dataScoreChart");
var timeChartCanvas = $("#timeChart");
var timeScoreChartCanvas = $("#timeScoreChart");
var  dataChart = new Chart(dataChartCanvas, {
            type: 'line',
            data: {
                labels: timestampBuffer,
                datasets: [{
                    label: 'Temperature Data',
                    data: dataBuffer,
                    backgroundColor: ['rgba(54, 162, 235, 0.5)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
          });
var  timeChart = new Chart(timeChartCanvas, {
            type: 'line',
            data: {
                labels: timestampBuffer,
                datasets: [{
                    label: 'Time Difference',
                    data: timeDiffBuffer,
                    backgroundColor: ['rgba(54, 162, 235, 0.5)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
});
var  dataScoreChart = new Chart(dataScoreChartCanvas, {
  type: 'bar',
  data: {
    datasets: [{
          label: 'Anomaly Score',
          yAxisID: "y-axis-1",
          data: zScore
        }, {
          label: 'Sensor Data',
          data: dataBuffer,
          yAxisID: "y-axis-2",
          type: 'line',
          backgroundColor: ['rgba(54, 162, 235, .5)']
        }],
    labels: timestampBuffer
  },
  options: {
                  responsive: true,
                  title:{
                      display:false,
                      text:"Temp Data and Deviation"
                  },
                  tooltips: {
                      mode: 'index',
                      intersect: true
                  },
                  scales: {
                      yAxes: [{
                          type: "linear",
                          display: true,
                          position: "left",
                          id: "y-axis-1",
                      }, {
                          type: "linear",
                          display: true,
                          position: "right",
                          id: "y-axis-2",
                          gridLines: {
                              drawOnChartArea: false
                          }
                      }],
                  }
              }
            });
var  timeScoreChart = new Chart(timeScoreChartCanvas, {
  type: 'bar',
  data: {
    datasets: [{
          label: 'Anomaly Score',
          yAxisID: "y-axis-1",
          data: timezScore
        }, {
          label: 'Sensor Data',
          data: timeDiffBuffer,
          yAxisID: "y-axis-2",
          type: 'line',
          backgroundColor: ['rgba(54, 162, 235, .5)']
        }],
    labels: timestampBuffer
  },
  options: {
                  responsive: true,
                  title:{
                      display:false,
                      text:"Temp Data and Deviation"
                  },
                  tooltips: {
                      mode: 'index',
                      intersect: true
                  },
                  scales: {
                      yAxes: [{
                          type: "linear",
                          display: true,
                          position: "left",
                          id: "y-axis-1",
                      }, {
                          type: "linear",
                          display: true,
                          position: "right",
                          id: "y-axis-2",
                          gridLines: {
                              drawOnChartArea: false
                          }
                      }],
                  }
              }
            });

// grab sensor id from url
var currentSensorId = window.location.search.split("=")[1];

var counterLog = $("#counterLog");
counterLog.text(anomalyCount);
//create POST json query
var sensorTitle = $("#sensorIdHeader");
sensorTitle.text(currentSensorId);
var payload = {
              "query": "DEFINE Sensor_Collection s1; DEFINE OBSERVATION_COLLECTION o1; s1 = SELECT ALL FROM Sensor WHERE id= \"" + currentSensorId +"\"; o1 = SENSOR_TO_OBSERVATION(s1); SELECT timeStamp timestamp, payload data, sensor.infrastructure.region.floor floor, sensor.sensorType.id sensorType, sensor.id  sensorId FROM o1;",
				"type": "TQL"
			};
// request data of sensorId
var saveData = $.ajax({
		headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		type: 'POST',
		url: "http://sensoria.ics.uci.edu:8001/api/query/select",
		data: JSON.stringify(payload),
		dataType: "json",
		success: function(resultData) {

      scanData(resultData);
      showSensorInfo(resultData);
      fillChart(resultData);
      anomalyDetector(sensitivity, zScore);

		},
		error: function() {
			console.log("error");
		}
});
//for all energyMeter Data
// DEFINE Sensor_Collection s1;
// DEFINE OBSERVATION_COLLECTION o1;
// s1 = SELECT ALL FROM Sensor WHERE sensorType.id="EnergyMeter";
// o1 = SENSOR_TO_OBSERVATION(s1);
// SELECT timeStamp timestamp, payload data,
// sensor.infrastructure.region.floor floor,
// sensor.sensorType.id sensorType,
// sensor.id  sensorId FROM o1;
function showSensorInfo(jsonObj){
  var sensorFloor = jsonObj[0]['floor'];
  var sensorType = jsonObj[0]['sensorType'];
  var startDate = jsonObj[0]['timestamp'];
  var endDate = jsonObj[jsonObj.length-2]['timestamp'];
  // length minus 2 because last item is not an observation.
  var sensorTypeTitle = $("#sensorType");
  var sensorFloorTitle = $("#sensorFloor");
  var startDateTitle = $("#startDate");
  var endDateTitle = $("#endDate");
  sensorTypeTitle.text(sensorType);
  sensorFloorTitle.text(sensorFloor);
  startDateTitle.text(startDate);
  endDateTitle.text(endDate);
}
function fillChart(jsonObj){
  for (var i = 0; i < jsonObj.length-1; i++) {
    dataBuffer[i] = jsonObj[i]['data']['temperature'];
    timestampBuffer[i] = jsonObj[i]['timestamp'];
  }
  timestampTrim();
  fillTimeDiffBuffer();
  timeChart.data.datasets[0].data = timeDiffBuffer;
  dataChart.data.labels = timestampBuffer;
  dataChart.data.datasets[0].data = dataBuffer;
  dataScoreChart.data.datasets[0].data = zScore;
  console.log(zScore);
  timeScoreChart.update();
  timeChart.update();
  dataScoreChart.update();
  dataChart.update();

}
function timestampTrim(){
  for (var i = 0; i < timestampBuffer.length; i++) {
    datetimeBuffer[i] = timestampBuffer[i];
    timestampBuffer[i]= timestampBuffer[i].split(" ")[3];
  }
}
function scanData(jsonObj){
  while(nextDataItem < jsonObj.length-1){
    fillBuffer(jsonObj);
    }
}
function fillBuffer(jsonObj){
    if(dataBuffer== 0){
        for(var i = dataStart; i <dataEnd; i++){
            dataBuffer[i] = jsonObj[i]['data']['temperature'];
            timestampBuffer[i] = jsonObj[i]['timestamp'];
        }
        zScore = zScoreP(dataBuffer);

        dataStart += dataBuffer.length;
        dataEnd += dataBuffer.length;
    }
    else{
        dataBuffer.shift();
        dataBuffer.push(jsonObj[nextDataItem]['data']['temperature']);
        timestampBuffer.shift();
        timestampBuffer.push(jsonObj[nextDataItem]['timestamp']);
        zScore.push(zScoreLastPoint(dataBuffer));

        nextDataItem++;
        }

}// end of fillBuffer
//anomaly Detection function
function zScoreP(data){
  var zScoreArray = [];
  var median = math.median(data);
  var mad = math.mad(data);
  var meanAD = meanAbsDev(data);
  if(mad!=0){
    for (var i = 0; i < data.length; i++) {
      zScoreArray[i] = (math.abs(data[i]-median))/(1.486*mad);
    }
  }
  else{
    for (var i = 0; i < data.length; i++) {
      zScoreArray[i] = (math.abs(data[i]-median))/(1.253313*meanAD);
    }
  }
  return zScoreArray;
}
function zScoreLastPoint(data){
  var zScorepoint;
  var median = math.median(data);
  var mad = math.mad(data);
  var meanAD = meanAbsDev(data);
  if(mad!=0){
      zScorepoint = (math.abs(data[data.length-1]-median))/(1.486*mad);
  }
  else{
      zScorepoint = (math.abs(data[data.length-1]-median))/(1.253313*meanAD);
  }
  return zScorepoint;
}// end zScoreP
function meanAbsDev(data) {
  var mean = math.mean(data);
  var sum=0;
  for (var i = 0; i < data.length; i++) {
    sum+= math.abs(data[i]-mean);
  }
  return (sum / data.length);
}// end meanAbsDev
function fillTimeDiffBuffer(){

  for (var i = 0; i < timestampBuffer.length-1; i++) {
    var t1 = timestampStrToObj(timestampBuffer[i]);
    var t2 = timestampStrToObj(timestampBuffer[i+1]);
  timeDiffBuffer.push(findTimeDiff(t1, t2));
  }
  timezScore = zScoreP(timeDiffBuffer);
  console.log(timezScore);
}
function timestampStrToObj(timestampString){
  var time = timestampString.split(":");
  var timestamp = {
  hour : time[0],
  min : time[1],
  sec : time[2]
  }
  return timestamp;
}
function findTimeDiff(t1, t2){// calculates time difference in seconds then returns in minutes
  var timeDiff= 0;
  var t1Total = 0;
  var t2Total =0;
    var t1h = parseInt(t1.hour*60*60) ;
    var t1m = parseInt(t1.min*60) ;
    var t1s = parseInt(t1.sec);
    var t2h = parseInt(t2.hour*60*60) ;
    var t2m = parseInt(t2.min*60) ;
    var t2s = parseInt(t2.sec);
    t1Total = (t1h + t1m + t1s);
    t2Total = (t2h + t2m + t2s);
    timeDiff = math.abs(t2Total-t1Total);
  return timeDiff/60;
}

function anomalyDetector(sensitivity, zScoreData){
  //preCond: zScoreData is an array with a score for each corresponding item in dataBuffer
  //postCond: calls renderHTML to fill anomaly log with points that pass the sensitivity #
  var anomalyPoints = [];

  for (var i = 0; i < zScoreData.length; i++) {
    if(zScoreData[i] >= sensitivity){
      var point = new Object();
      point.index = i;
      point.zScore = zScoreData[i];
      anomalyPoints.push(point)
      anomalyCount++;
      }
      counterLog.text(anomalyCount);
  }
  renderHTML(anomalyPoints);
}
function renderHTML(eventsToPrint){
  var htmlString = "";
  for (var i = 0; i < eventsToPrint.length; i++) {
    htmlString += "<tr>" + "<td class=\"col-xs-1\">" + math.round(eventsToPrint[i].zScore, 2) + "</td><td class=\"col-xs-4\">" + datetimeBuffer[eventsToPrint[i].index] + "</td><td class=\"col-xs-2\">" + "observational" + "</td><td class=\"col-xs-2\">" + dataBuffer[eventsToPrint[i].index] + "</td><td class=\"col-xs-2\">" + "Degrees" + "</td></tr>";
    }
  eventContainer.insertAdjacentHTML('beforeend',htmlString);
}
