var boshService = "https://sox.ht.sfc.keio.ac.jp:5281/http-bind/";
var xmppServer = "sox.ht.sfc.keio.ac.jp";
var client;

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
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileGenova'){
            // Set Genova Smile Value
            targetID = "genova-smile";
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileSantander'){
            // Set Santander Smile Value
            targetID = "santander-smile";
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
        }
        if (device.name == 'TodayTotalSmileMitaka'){
            // Set Mitaka Smile Value
            targetID = "mitaka-smile";
            setSmileLevel(targetID, device.transducers[levelNum].sensorData.rawValue);
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

function openCookiePage() {
    url = $.cookie("url");
    location.replace(url);
}
