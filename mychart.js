// variables
var dataBuffer = [];
var datestampBuffer = [];
var timestampBuffer = [];
var timeDiffBuffer = [];
var currentSensorIndexes = [];
var currentSensorId = "emeter3";
var datarequestURL = ["https://raw.githubusercontent.com/angel90650/TestData/master/mock%20timedata.json","https://raw.githubusercontent.com/angel90650/TestData/master/temperatureObs%5B3977%5D.json","https://raw.githubusercontent.com/angel90650/TestData/master/MOCK_DATA.json"];
var zScore = [];
var bufferSize = 50;
var nextDataItem = bufferSize;
var dataStart = 0;
var dataEnd = 0 + bufferSize;
var sensitivity = 1.49;
var ctx = $("canvas");
var refreshBtn = document.getElementById('refreshBtn');
var eventContainer = document.getElementById("eventContainer");
var myChartDev = new Chart(ctx[1], {
    type: 'bar',
    data: {
        labels: timestampBuffer,
        datasets: [{
            label: 'Deviation',
            data: zScore,
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
var mixedChart = new Chart(ctx[2], {
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
var  myChart = new Chart(ctx[0], {
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
          var timeDiffChart = new Chart(ctx[3], {
              type: 'bar',
              data: {
                  labels: timestampBuffer,
                  datasets: [{
                      label: 'Deviation',
                      data: timeDiffBuffer,
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
          var timeDiffscoreChart = new Chart(ctx[4], {
              type: 'bar',
              data: {
                  labels: timestampBuffer,
                  datasets: [{
                      label: 'Deviation',
                      data: timeDiffBuffer,
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
          var mixedTimeChart = new Chart(ctx[5], {
          type: 'bar',
          data: {
            datasets: [{
                  label: 'Anomaly Score',
                  yAxisID: "y-axis-1",
                  data: zScore
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
                              text:"Time Difference and Deviation"
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
// function to request data and setup
function dataRequest(url){
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  request.onload = function() {
      var testData = JSON.parse(request.response);
      fillBuffer(testData);
      fillTimeDiffBuffer();
      }
}
// initial setup
dataRequest(datarequestURL[1]);
//create data buffer for graph

function fillBuffer(jsonObj){
    if(dataEnd>= currentSensorIndexes.length){
      dataStart = 0;
      dataEnd = bufferSize;
    }
    if(jsonObj[0]['typeId']=="EnergyMeterType"){
      findIndexesOfSensorId(jsonObj, currentSensorId);
    if(dataBuffer== 0){
        for(var i = dataStart; i <dataEnd; i++){
            dataBuffer[i] = jsonObj[currentSensorIndexes[i]]['payload']['temperature'];
            timestampBuffer[i] = jsonObj[currentSensorIndexes[i]]['timestamp'];
        }
        dataStart += dataBuffer.length;
        dataEnd += dataBuffer.length;


    }
    else{
        dataBuffer.shift();
        dataBuffer.push(jsonObj[currentSensorIndexes[nextDataItem]]['payload']['temperature']);
        timestampBuffer.shift();
        timestampBuffer.push(jsonObj[currentSensorIndexes[nextDataItem]]['timestamp']);
        nextDataItem++;
        }
      }//end EnergyMeterType fill
zScore = zScoreP(dataBuffer);
anomalyDetector(sensitivity, zScore);

myChartDev.data.labels = timestampBuffer;
myChartDev.data.datasets[0].data = zScore;
mixedChart.data.labels = timestampBuffer;
mixedChart.data.datasets[0].data = zScore;
myChart.data.labels = timestampBuffer;
myChart.data.datasets[0].data = dataBuffer;
mixedChart.update(0);
myChart.update();
myChartDev.update(0);
}// end of fillBuffer
function findIndexesOfSensorId(jsonObj, sensorId){
  for (var i = 0; i < jsonObj.length; i++) {
    if(sensorId==jsonObj[i].sensorId){
      currentSensorIndexes.push(i);
    }
  }
}
function timestampStrToObj(timestampString){
  var dateTime = timestampString.split(" ");
  var date = dateTime[0].split("-");
  var time = dateTime[1].split(":");
  var timestamp = {
  year : date[0],
  month : date[1],
   day : date[2],
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
function fillTimeDiffBuffer(){
  var timeDiff;

  if(timeDiffBuffer.length==0){
    for (var i = 0; i < timestampBuffer.length-1; i++) {
      var timestamp = timestampStrToObj(timestampBuffer[i]);

      var timestampNext = timestampStrToObj(timestampBuffer[i+1]);
    var timeDiff =  findTimeDiff(timestamp, timestampNext);
    timeDiffBuffer.push(timeDiff);
    }
  }else{
    timeDiffBuffer.shift();
    var timestamp = timestampStrToObj(timestampBuffer[bufferSize-2]);

    var timestampNext = timestampStrToObj(timestampBuffer[bufferSize-1]);
  var timeDiff =  findTimeDiff(timestamp, timestampNext);
  timeDiffBuffer.push(timeDiff);

    }
  zScore = zScoreP(timeDiffBuffer);
  anomalyDetector(sensitivity, zScore);
  timeDiffChart.data.labels = timestampBuffer;
  timeDiffChart.data.datasets[0].data = timeDiffBuffer;
  timeDiffChart.update();
  timeDiffscoreChart.data.labels = timestampBuffer;
  timeDiffscoreChart.data.datasets[0].data = zScore;
  timeDiffscoreChart.update();

  mixedTimeChart.update();
}// end fillTimeDiffBuffer

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
}// end zScoreP

function meanAbsDev(data) {
  var mean = math.mean(data);
  var sum=0;
  for (var i = 0; i < data.length; i++) {
    sum+= math.abs(data[i]-mean);
  }
  return (sum / data.length);
}// end meanAbsDev

// next print zscore and data points in order to comopare
//then create analyze() that identify outliers and print them
// create an event log in the html file
//make analyze update the event log

function renderHTML(eventsToPrint){
  var htmlString = "";
  for (var i = 0; i < eventsToPrint.length; i++) {
    //htmlString += "<li>" +eventsToPrint[i].date + ", Temp: " +eventsToPrint[i].Temp+ "</li>";
    htmlString += "<tr>" +"<td>"+ dataBuffer[eventsToPrint[i].index]+ "</td>" + "<td>"+ eventsToPrint[i].zScore+ "</td>"+ "<td>"+ timestampBuffer[eventsToPrint[i].index]+"</td>"+  "<td>"+ currentSensorId+"</td>"+"</tr>";
    }
  eventContainer.insertAdjacentHTML('beforeend',htmlString);
}
function anomalyDetector(sensitivity, zScoreData){

  var anomalyPoints = [];
  var anomalyCount=0;
  for (var i = 0; i < zScoreData.length; i++) {
    if(zScoreData[i] >= sensitivity){
      var point = new Object();
      point.index = i;
      point.zScore = zScoreData[i];
      anomalyPoints.push(point)
      anomalyCount++;
  }

  }
  renderHTML(anomalyPoints);
}

//Refresh config
setInterval(function() {dataRequest(datarequestURL[1]);},'3000');
