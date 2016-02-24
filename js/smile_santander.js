var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

var TARGET_CITY = "Santander";
var ENV = TARGET_CITY + "WeatherDemo";

var temperature = 0;
var windspeed = 0;
var humidity = 0;
var rainfall = 0;

window.onload = function() {
    $.cookie("url", window.location.href, {expires: 1});

    // SoxServerへ接続
    client = new SoxClient(boshService, xmppServer);
    var soxEventListener = new SoxEventListener();

    soxEventListener.connected = function(soxEvent) {
        status("Connected: "+soxEvent.soxClient);

		setTimeout(function(){
			client.disconnect();
		}, 57000);


        var deviceNames = [
            ENV,
            "TodayTotalSmileSantander",
            "SantanderWeatherSensorDemo"
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
            var data_city = new SensorData("city", new Date(), "santander", "santander");
            var data_level = new SensorData("level", new Date(), 1, 1);
            

            transducer_latitude.setSensorData(data_latitude);
            transducer_longitude.setSensorData(data_longitude);
            transducer_city.setSensorData(data_city);
            transducer_level.setSensorData(data_level);

            soxEvent.soxClient.publishDevice(soxEvent.device);

            $.toast({
                bgColor: '#32cd32',
                text: "Thank you!",
                stack: true,
                position: 'mid-center',
                textAlign: 'center',
                hideAfter: false
            });
            setTimeout("openEngCNC()", 1500);
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

        if (device.name == ENV){
            status("Env info received");
            temperature = device.transducers[4].sensorData.rawValue;
            windspeed = device.transducers[5].sensorData.rawValue;
            humidity = device.transducers[6].sensorData.rawValue;
            rainfall = device.transducers[7].sensorData.rawValue;
            setSoxParams(temperature, windspeed, humidity, rainfall);
        }
        if (device.name == "TodayTotalSmileSantander"){
            var level = device.transducers[2].sensorData.rawValue;

            setCurrentSmileLevel(level);
        }
        if (device.name == "SantanderWeatherSensorDemo") {
            // DO SOMETHING
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
