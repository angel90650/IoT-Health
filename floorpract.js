
var floorNum = window.location.search.split("=")[1];
var payloadFloor = {
  "query" : "DEFINE Sensor_Collection s1; DEFINE OBSERVATION_COLLECTION o1; s1 = SELECT ALL FROM Sensor WHERE infrastructure.region.floor="+ floorNum+ " ; o1 = SENSOR_TO_OBSERVATION(s1); SELECT timeStamp timestamp, payload data, sensor.infrastructure.region.floor floor, sensor.sensorType.id sensorType, sensor.id  sensorId FROM o1;",
  "type" : "TQL"
}

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
