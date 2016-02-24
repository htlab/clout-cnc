var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

window.onload = function() {

    // SoxServerへ接続
	client = new SoxClient(boshService, xmppServer);
	var soxEventListener = new SoxEventListener();

	soxEventListener.connected = function(soxEvent) {
		status("Connected: "+soxEvent.soxClient);
		
		var deviceNames = ['江ノ島ヨットハーバー_mini', 'World Weather Japan - Yokohama', '藤沢今日のおすすめ', '藤沢今日のおすすめ2'];

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

	soxEventListener.resolved = function(soxEvent) {
		status("Device Resolved: "+soxEvent.soxClient);

        if(soxEvent.device.name == "cnc_good2"){

            /**
             * specify the transducer to publish
             */
            var transducer_city = soxEvent.device.getTransducer("temperature");
            var transducer_degree = soxEvent.device.getTransducer("latitude");

            /**
             * create a value
             */
            var data_city = new SensorData("city", new Date(), CITY, CITY);
            var data_degree = new SensorData("degree", new Date(), getDegree(), getDegree());

            /**
             * set the value to the transducer
             */
            transducer_city.setSensorData(data_city);
            transducer_degree.setSensorData(data_degree);

            /**
             * publish
             */
            soxEvent.soxClient.publishDevice(soxEvent.device);
        }

	};

	soxEventListener.resolveFailed = function(soxEvent){
		/* couldn't get device information from the server */
		status("Resolve Failed: "+soxEvent.device+" code="+soxEvent.errorCode+" type="+soxEvent.errorType);
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
		if (device.name == 'World Weather Japan - Yokohama'){
			var weatherIconNum = 5;
			var temperatureNum = 6;
            setWeatherIcon(device.transducers[weatherIconNum].sensorData.rawValue);
		}

		if (device.name == '江ノ島ヨットハーバー_mini'){
            var temperatureNum = 4;
            var humidityNum = 5;
			setTemperature(device.transducers[temperatureNum].sensorData.rawValue);
			setHumidity(device.transducers[humidityNum].sensorData.rawValue);
        }

		if (device.name == '藤沢今日のおすすめ'){
            var pictureNum = 3;
            var messageNum = 4;

            setFujisawaPicture(device.transducers[pictureNum].sensorData.rawValue);
            setFujisawaMessage(device.transducers[messageNum].sensorData.rawValue);

        }

		if (device.name == '藤沢今日のおすすめ2'){
            var pictureNum = 3;
            var messageNum = 4;

            setFujisawaPicture(device.transducers[pictureNum].sensorData.rawValue);
            setFujisawaMessage(device.transducers[messageNum].sensorData.rawValue);

        }


	};
	
	client.setSoxEventListener(soxEventListener);
	client.connect();
};

function publishCityGood(){
    var device = new Device('cnc_good2', client);
}

function status(message){
    console.log('[soxreceiver.js]' + message);
}
