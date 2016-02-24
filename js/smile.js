var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

window.onload = function() {

    // SoxServerへ接続
    client = new SoxClient(boshService, xmppServer);
    var soxEventListener = new SoxEventListener();

    soxEventListener.connected = function(soxEvent) {
        status("Connected: "+soxEvent.soxClient);
        
        var deviceName = "TodayTotalSmileMitaka";
        var device = new Device(deviceName);
        /* クライアントに繋がったら、デバイスにサブスクライブする */
        if(!client.subscribeDevice(device)){
            /* サーバに繋がってない場合などで、要求を送信できなかった場合はfalseが返ってくる */
            status("Couldn't send subscription request: "+device);
        }

    };
    soxEventListener.resolved = function(soxEvent) {
        status("Device Resolved: " + soxEvent.soxClient);

        if (soxEvent.device.name == "SmileDetector") {
            var transducer_city = soxEvent.device.getTransducer("city");
            var transducer_level = soxEvent.device.getTransducer("level");

            var data_city = new SensorData("city", new Date(), CITY, CITY);
            var data_level = new SensorData("level", new Date(), 1, 1);

            transducer_city.setSensorData(data_city);
            transducer_level.setSensorData(data_level);

            soxEvent.soxClient.publishDevice(soxEvent.device);

            $.toast({
                bgColor: 'green',
                text: "ありがとう！",
                stack: true,
                position: 'mid-center',
                textAlign: 'center',
            });
            setTimeout("openCNC()", 1500);
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

        if (device.name == "TodayTotalSmileFujisawa"){
            var levelNum = 3;
            var targetID = "#smile-data";
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
    };
    
    client.setSoxEventListener(soxEventListener);
    client.connect();
};

function publishSmileLevel() {
    var device = new Device("SmileDetector");
}

function status(message){
    console.log('[soxreceiver.js]' + message);
}
