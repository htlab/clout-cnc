var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

var fujisawaAvgTemp = 16;
var fujisawaAvgHum = 61.9
var santanderAvgTemp = 13.9;
var santanderAvgHum = 73;
var genovaAvgTemp = 19;
var genovaAvgHum = 68;
var mitakaAvgTemp = 16;
var mitakaAvgHum = 61.9
var count = 0;

window.onload = function() {

    showEnvironmental();
    setInterval(function(){
        if(count < 5){
            switch(count%3){
                case 0:
                    showLiving();
                    break;
                case 1:
                    showWashing();
                    break;
                case 2:
                    showEnvironmental();
                    break;
            }
            count++;
        } else {
            if ($.cookie("url")) {
                client.disconnect();
                openCookiePage();
            }
        }
    }, 5000);

    // SoxServerへ接続
    client = new SoxClient(boshService, xmppServer);
    var soxEventListener = new SoxEventListener();

    soxEventListener.connected = function(soxEvent) {
        status("Connected: "+soxEvent.soxClient);

        var deviceNames = [
			'そらまめ君連雀通り下連雀',
			'そらまめ君藤沢市役所',
			'SantanderWeatherSensorDemo',
			'GenovaWeatherSensorDemo',
            'TodayTotalSmileFujisawa',
            'TodayTotalSmileMitaka',
            'TodayTotalSmileGenova',
            'TodayTotalSmileSantander',
            'GenovaWeatherDemo',
            'SantanderWeatherDemo'
        ];

        deviceNames.forEach(function(name){
            var device = new Device(name);
            /* クライアントに繋がったら、デバイスにサブスクライブする */
            if(!client.subscribeDevice(device)){
                /* サーバに繋がってない場合などで、要求を送信できなかった場合はfalseが返ってくる */
                status("Couldn't send subscription request: "+device);
            }
        });

    };

    soxEventListener.connectionFailed = function(soxEvent) {
        status("Connection Failed: "+soxEvent.soxClient);
    };

    soxEventListener.subscribed = function(soxEvent){
        status("Subscribed: "+soxEvent.device);
    };
    soxEventListener.subscriptionFailed = function(soxEvent){
        /* デバイスが存在しないなどのときはここに来る */
        status("Subscription Failed: "+soxEvent.device);
    };
    soxEventListener.metaDataReceived = function(soxEvent){
        /**
         * SoXサーバからデバイスのメタ情報を受信すると呼ばれる。
         * 受信したメタ情報に基づいて、Device内にTransducerインスタンスが生成されている。
         */
        status("Meta data received: "+soxEvent.device);
    };
    soxEventListener.sensorDataReceived = function(soxEvent){
        /**
         * SoXサーバからセンサデータを受信すると呼ばれる。
         * 受信したデータはTransducerインスタンスにセットされ、そのTransducerがイベントオブジェクトとして渡される。
         */
        status("Sensor data received: "+soxEvent.device);

        var device = soxEvent.device;
        var levelNum = 2;

        if (device.name == 'TodayTotalSmileFujisawa'){
            // Set Fujisawa Smile Value
            targetID = "fujisawa-smile";
			var smile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileGenova'){
            // Set Genova Smile Value
            targetID = "genova-smile";
			var smile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileSantander'){
            // Set Santander Smile Value
            targetID = "santander-smile";
			var smile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileMitaka'){
            // Set Mitaka Smile Value
            targetID = "mitaka-smile";
			var smile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
		if (device.name == 'そらまめ君連雀通り下連雀'){
            // Set Mitaka Air Value
            targetID = "mitaka-air";
			var no2 = device.transducers[6].sensorData.rawValue;
			var temperature = device.transducers[18].sensorData.rawValue;
			var humidity = device.transducers[19].sensorData.rawValue;
            var windspeed = device.transducers[17].sensorData.rawValue;
            var rainfall = 0;
            setParam('mitaka-washing', calcWashingIndex(temperature, humidity, windspeed, mitakaAvgTemp, mitakaAvgHum));
            setParam('mitaka-living', calcLivingIndex(temperature, humidity));
            setAirCondition(targetID, no2);
		}
		if (device.name == 'そらまめ君藤沢市役所'){
            // Set Fujisawa Air Value
            targetID = "fujisawa-air";
			var no2 = device.transducers[6].sensorData.rawValue;
			var temperature = device.transducers[18].sensorData.rawValue;
			var humidity = device.transducers[19].sensorData.rawValue;
            var windspeed = device.transducers[17].sensorData.rawValue;
            setParam('fujisawa-washing', calcWashingIndex(temperature, humidity, windspeed, fujisawaAvgTemp, fujisawaAvgHum));
            setParam('fujisawa-living', calcLivingIndex(temperature, humidity));
            setAirCondition(targetID, no2);
		}
		if (device.name == 'SantanderWeatherSensorDemo'){
            // Set Santander Air Value
            targetID = "santander-air";
			var no2 = device.transducers[8].sensorData.rawValue;
			var temperature = device.transducers[2].sensorData.rawValue;
			var humidity = device.transducers[5].sensorData.rawValue;
            setParam('santander-living', calcLivingIndex(temperature, humidity));
            setAirCondition(targetID, no2);
		}
		if (device.name == 'GenovaWeatherSensorDemo'){
            // Set Genova Air Value
            targetID = "genova-air";
			var no2 = device.transducers[8].sensorData.rawValue;
			var temperature = device.transducers[2].sensorData.rawValue;
			var humidity = device.transducers[5].sensorData.rawValue;
			if (isNaN(Number(no2))){
				no2 = 0;
			}
            setParam('genova-living', calcLivingIndex(temperature, humidity));
            setAirCondition(targetID, no2);
		}

        if (device.name == 'SantanderWeatherDemo'){
            var temperature = device.transducers[4].sensorData.rawValue;
            var windspeed = device.transducers[5].sensorData.rawValue;
            var humidity = device.transducers[6].sensorData.rawValue;
            setParam('santander-washing', calcWashingIndex(temperature, humidity, windspeed, santanderAvgTemp, santanderAvgHum));
        }

        if (device.name == 'GenovaWeatherDemo'){
            var temperature = device.transducers[4].sensorData.rawValue;
            var windspeed = device.transducers[5].sensorData.rawValue;
            var humidity = device.transducers[6].sensorData.rawValue;
            setParam('genova-washing', calcWashingIndex(temperature, humidity, windspeed, genovaAvgTemp, genovaAvgHum));
        }


    };
    
    client.setSoxEventListener(soxEventListener);
    client.connect();
};

function status(message){
    console.log('[soxreceiver.js]' + message);
}

function setSmileLevel(id, degree){
    document.getElementById(id).innerHTML = degree;
}

function setAirCondition(id, air){
	document.getElementById(id).innerHTML = calcEnvironmentalIndex(air);
}

function setParam(id, param){
	document.getElementById(id).innerHTML = param;
}


function openCookiePage() {
    url = $.cookie("url");
    location.replace(url);
}

function hideAll(){
    $('.data-header').hide();
    $('.data').hide();
}

function showEnvironmental(){
    hideAll();
    $('.air-header').show();
    $('#fujisawa-air').show();
    $('#mitaka-air').show();
    $('#genova-air').show();
    $('#santander-air').show();
}

function showLiving(){
    hideAll();
    $('.living-header').show();
    $('#fujisawa-living').show();
    $('#mitaka-living').show();
    $('#genova-living').show();
    $('#santander-living').show();
}

function showWashing(){
    hideAll();
    $('.washing-header').show();
    $('#fujisawa-washing').show();
    $('#mitaka-washing').show();
    $('#genova-washing').show();
    $('#santander-washing').show();
}
