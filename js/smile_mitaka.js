var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

var TARGET_CITY = "Mitaka";

var weatherNumber = 0;
var averageHumidity = 67;
var averageTemperature = 15.8;

window.onload = function() {
    $.cookie("url", window.location.href, {expires: 1});

    // SoxServerへ接続
    client = new SoxClient(boshService, xmppServer);
    var soxEventListener = new SoxEventListener();

    soxEventListener.connected = function(soxEvent) {
        status("Connected: "+soxEvent.soxClient);

		setTimeout(function(){
			client.disconnect();
            openCNC();
		}, 57000);

        var deviceNames = [
            "気象警報・注意報三鷹市",
            "そらまめ君武蔵野市関前",
            "三鷹市のピンポイント天気",
            "三鷹市今日の降水確率2",
            "TodayTotalSmileMitaka",
            "そらまめ君連雀通り下連雀"
        ];

        deviceNames.forEach(function(name){
            var device = new Device(name);//デバイス名に_dataや_metaはつけない
            /* クライアントに繋がったら、デバイスにサブスクライブする */
            if(!client.subscribeDevice(device)){
                /* サーバに繋がってない場合などで、要求を送信できなかった場合はfalseが返ってくる */
                status("Couldn't send subscription request: "+device);
            }
        });
    };

    soxEventListener.resolved = function(soxEvent) {
        status("Device Resolved: " + soxEvent.soxClient);

        if (soxEvent.device.name == "SmileDetector") {
            var transducer_latitude = soxEvent.device.getTransducer("latitude");
            var transducer_longitude = soxEvent.device.getTransducer("longitude");
            var transducer_city = soxEvent.device.getTransducer("city");
            var transducer_level = soxEvent.device.getTransducer("level");

            var data_latitude = new SensorData("latitude", new Date(), 0, 0);
            var data_longitude = new SensorData("longitude", new Date(), 0, 0);
            var data_city = new SensorData("city", new Date(), "mitaka", "mitaka");
            var data_level = new SensorData("level", new Date(), 1, 1);
            

            transducer_latitude.setSensorData(data_latitude);
            transducer_longitude.setSensorData(data_longitude);
            transducer_city.setSensorData(data_city);
            transducer_level.setSensorData(data_level);

            soxEvent.soxClient.publishDevice(soxEvent.device);

            $.toast({
                bgColor: '#32cd32',
                text: "いいねが溜まったよ！",
                stack: true,
                position: 'mid-center',
                textAlign: 'center',
                hideAfter: false
            });
            //setTimeout("openCNC()", 1500);
        }
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

        if (device.name == "気象警報・注意報三鷹市") {
            var effectiveHumidity = 0;
            var minimumHumidity = 0;

            var statement = device.transducers[3].sensorData.rawValue;
            var word = statement.split("　");

            for (var i = 0; i < word.length; i++) {
                if (word[i] == "最小湿度") {
                    effectiveHumidity = getHumidity(word[i - 1]);
                    minimumHumidity = getHumidity(word[i + 1]);
                }
                else {
                    effectiveHumidity = 100;
                    minimumHumidity = 100;
                }
            }


            processDryness(effectiveHumidity, minimumHumidity);
        }
        if (device.name == "三鷹市のピンポイント天気") {
            weather = device.transducers[2].sensorData.rawValue;

            weatherNumber = getWeatherNumber(weather);
        }
        if (device.name == "そらまめ君武蔵野市関前") {
            windspeed = device.transducers[17].sensorData.rawValue;
            temperature = device.transducers[18].sensorData.rawValue;
            humidity = device.transducers[19].sensorData.rawValue;

            processLivingIndex(temperature, humidity);
            processWashingIndex(temperature, windspeed, humidity);
        }
        if (device.name == "三鷹市今日の降水確率2") {
            var percentage = 0;
            var date = new Date();
            var hour = date.getHours();
            var id = Math.floor(hour / 3);

            // until 0a.m to 6a.m
            if (id == 0 || id == 8) {
                percentage = device.transducers[3].sensorData.rawValue;
            } 
            else if (id == 1) {
                percentage = device.transducers[4].sensorData.rawValue;
            } 
            else if (id == 2) {
                percentage = device.transducers[5].sensorData.rawValue;
            } 
            else if (id == 3) {
                percentage = device.transducers[6].sensorData.rawValue;
            } 
            else if (id == 4) {
                percentage = device.transducers[7].sensorData.rawValue;
            } 
            else if (id == 5) {
                percentage = device.transducers[8].sensorData.rawValue;
            } 
            else if (id == 6) {
                percentage = device.transducers[9].sensorData.rawValue;
            } 
            else if (id == 7) {
                percentage = device.transducers[10].sensorData.rawValue;
            } 

            setRainyPercentage(percentage);
        }
        if (device.name == "TodayTotalSmileMitaka") {
            level = device.transducers[2].sensorData.rawValue;

            setCurrentSmileLevel(level);
            setSmileBoxLevel(level);
        }
        if (device.name == "そらまめ君連雀通り下連雀") {
            no2 = device.transducers[6].sensorData.rawValue;
            processEnvironmentalIndex(no2);
        }
    };

    soxEventListener.published = function(soxEvent){
        //goResultPage();
    }
    
    client.setSoxEventListener(soxEventListener);
    client.connect();
};

function publishSmileLevel() {
    var device = new Device("SmileDetector", client);
}

function status(message){
    console.log('[soxreceiver.js]' + message);
}
