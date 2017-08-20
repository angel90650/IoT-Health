var payload = {
              "query": "DEFINE Sensor_Collection s1; DEFINE OBSERVATION_COLLECTION o1; s1 = SELECT ALL FROM Sensor WHERE sensorType.id=\"EnergyMeter\" AND infrastructure.region.floor=2; o1 = SENSOR_TO_OBSERVATION(s1); SELECT timeStamp timestamp, payload data, sensor.infrastructure.region.floor floor, sensor.sensorType.id sensorType, sensor.id  sensorId FROM o1;",
				"type": "TQL"
			};

var payloadFloor = {
  "query" : "DEFINE Sensor_Collection s1; DEFINE OBSERVATION_COLLECTION o1; s1 = SELECT ALL FROM Sensor WHERE infrastructure.region.floor="+ floorNum+ " ; o1 = SENSOR_TO_OBSERVATION(s1); SELECT timeStamp timestamp, payload data, sensor.infrastructure.region.floor floor, sensor.sensorType.id sensorType, sensor.id  sensorId FROM o1;",
  "type" : "TQL"
}
//
//       "DEFINE Sensor_Collection s1;
// DEFINE OBSERVATION_COLLECTION o1;
// s1 = SELECT ALL FROM Sensor WHERE id='emeter1';
// o1 = SENSOR_TO_OBSERVATION(s1);
// SELECT timeStamp x, payload.temperature y, sensor.id  id
// FROM o1
// WHERE timeStamp Like "Tue Jul 11 02:%" OR timeStamp Like "Tue Jul 11 03:%";
// "

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
							console.log(resultData);

						},
						error: function() {
							console.log("error");
						}
					});

function buildQuery(floorNum, sensorId, timeA , timeB){
	var query = "DEFINE Sensor_Collection s1; DEFINE OBSERVATION_COLLECTION o1;";
	if(floorNum>0 && floorNum <=6){
		query+="s1 = SELECT ALL FROM Sensor WHERE infrastructure.region.floor=2"
	}
}console.log(saveData.responseText);
