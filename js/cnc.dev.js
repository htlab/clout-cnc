var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

var fujisawaSmile = 0;
var fujisawaAir = 0;

var mitakaSmile = 0;
var mitakaAir = 0;

var genovaSmile = 0;
var genovaAir = 0;

var santanderSmile = 0;
var santanderAir = 0;

window.onload = function() {
    if ($.cookie("url")) {
        setTimeout("openCookiePage()", 10000);
    }

    // SoxServerへ接続
    client = new SoxClient(boshService, xmppServer);
    var soxEventListener = new SoxEventListener();

    soxEventListener.connected = function(soxEvent) {
        status("Connected: "+soxEvent.soxClient);
        
		setTimeout(function(){
			client.disconnect();
		}, 3000);

        var deviceNames = [
			'そらまめ君連雀通り下連雀',
			'そらまめ君藤沢市役所',
			'SantanderWeatherSensorDemo',
			'GenovaWeatherSensorDemo',
            'TodayTotalSmileFujisawa',
            'TodayTotalSmileMitaka',
            'TodayTotalSmileGenova',
            'TodayTotalSmileSantander'
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
			fujisawaSmile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
            setAirCondition("fujisawa-air", fujisawaAir, fujisawaSmile);
        }
        if (device.name == 'TodayTotalSmileGenova'){
            // Set Genova Smile Value
            targetID = "genova-smile";
			genovaSmile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
            setAirCondition("genova-air", genovaAir, genovaSmile);
        }
        if (device.name == 'TodayTotalSmileSantander'){
            // Set Santander Smile Value
            targetID = "santander-smile";
			santanderSmile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
            setAirCondition("santander-air", santanderAir, santanderSmile);
        }
        if (device.name == 'TodayTotalSmileMitaka'){
            // Set Mitaka Smile Value
            targetID = "mitaka-smile";
			mitakaSmile = device.transducers[levelNum].sensorData.rawValue
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
            setAirCondition("mitaka-air", mitakaAir, mitakaSmile);
        }
		if (device.name == 'そらまめ君連雀通り下連雀'){
            // Set Mitaka Air Value
            targetID = "mitaka-air";
			var value = device.transducers[6].sensorData.rawValue;
			mitakaAir = value;
            setAirCondition(targetID, value, mitakaSmile);
		}
		if (device.name == 'そらまめ君藤沢市役所'){
            // Set Fujisawa Air Value
            targetID = "fujisawa-air";
			var value = device.transducers[6].sensorData.rawValue;
			fujisawaAir = value;
            setAirCondition(targetID, value, fujisawaSmile);
		}
		if (device.name == 'SantanderWeatherSensorDemo'){
            // Set Santander Air Value
            targetID = "santander-air";
			var value = device.transducers[8].sensorData.rawValue;
			santanderAir = value;
            setAirCondition(targetID, value, santanderSmile);
		}
		if (device.name == 'GenovaWeatherSensorDemo'){
            // Set Genova Air Value
            targetID = "genova-air";
			var value = device.transducers[8].sensorData.rawValue;
			if (isNaN(Number(value))){
				value = 0;
			}
			genovaAir = value;
            setAirCondition(targetID, value, genovaSmile);
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

function setAirCondition(id, air, smile){
	var degree = Math.floor(smile * 2 - air);
	document.getElementById(id).innerHTML = degree;
}

function openCookiePage() {
    url = $.cookie("url");
    location.replace(url);
}
