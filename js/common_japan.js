function getHumidity(str) {
    var fullWidthNumber = str.substr(0, str.length - 5);
    var value = fullWidthNumber.replace(/[！-～]/g, function(tmpStr) {
        return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
    });

    return Number(value);
}
function getWeatherNumber(value) {
    var number;

    if (value.indexOf("晴") > -1 && value.indexOf("曇") > -1) {
        number = 1;
    }
    else if (value.indexOf("雨") > -1 && value.indexOf("曇") > -1) {
        number = 3;
    }
    else if (value.indexOf("晴") > -1) {
        number = 0;
    }
    else if (value.indexOf("曇") > -1) {
        number = 2;
    }
    else if (value.indexOf("雨") > -1) {
        number = 4;
    }
    else {
        number = 5;
    }

    return number;
}

function calcEnvironmentalIndex(no2){
    if (isNaN(Number(no2))){
        no2 = 0;
    }
    var value = Math.floor(100 - no2*6); 
    if (value > 100){
        value = 100;
    } else if (value < 0){
        value = 0;
    }
    return value;
}

function processEnvironmentalIndex(no2){
    setEnvironmentalDesc(calcEnvironmentalIndex(no2));
}

function calcWashingIndex(temperature, humidity, windspeed, avgTemp, avgHum){

    if (isNaN(Number(temperature)) || temperature == ""){
        temperature =avgTemp;
    } else {
        temperature = Number(temperature);
    }

    if (isNaN(Number(humidity)) || humidity == ""){
        humidity = avgHum;
    } else {
        humidity = Number(humidity);
    }

    if (isNaN(Number(windspeed)) || windspeed == ""){
        windspeed = 0;
    } else {
        windspeed = Number(humidity);
    }
    var index = 100 
        - ((humidity - avgHum) * 1.5)
        + ((temperature - avgTemp) * 0.8)
        + (windspeed * 1);

    if (index > 100){
        index = 100;
    } else if (index < 0){
        index = 0;
    }

    return Math.floor(index);
}

function processWashingIndex(temperature, windspeed, humidity) {
    var message = "";
    var washingIndex = 100;

    washingIndex = washingIndex - (weatherNumber * 20)
        - ((humidity - averageHumidity) * 1.5)
        + ((temperature - averageTemperature) * 1.2)
        + (windspeed * 30);
    if (washingIndex < 0) {
        washingIndex = 0;
    } else if (washingIndex > 100) {
        washingIndex = 100;
    }

    if (washingIndex <= 30) {
        message = "室内に干すのがおすすめ..";
    }
    else if (washingIndex > 30 && washingIndex <= 50) {
        message = "洗濯物は乾ききらないかも..";
    }
    else if (washingIndex > 50 && washingIndex <= 70) {
        message = "外に干すと洗濯ものが乾きそう";
    }
    else if (washingIndex > 70 && washingIndex <= 80) {
        message = "洗濯物がよく乾きそう！";
    }
    else if (washingIndex >= 90 && washingIndex <= 100) {
        message = "洗濯物は非常によく乾くよ!";
    }

    setWashingIndex(washingIndex, message);
}
function setWashingIndex(washingIndex, message) {
    $("#washing-index").html(washingIndex);
    $("#washing-desc").html(message);
}

function calcLivingIndex(temperature, humidity){
    var message = "";
    var base = 70;
    var discomfortIndex = 0.81 * temperature
        + 0.01 * humidity * (0.99 * temperature - 14.3)
        + 46.3;

    var livingIndex = Math.floor(100 - 3 * Math.abs(base - discomfortIndex));
    return livingIndex;
}

function processLivingIndex(temperature, humidity) {
    var message = "";
    var base = 70;
    var discomfortIndex = 0.81 * temperature
        + 0.01 * humidity * (0.99 * temperature - 14.3)
        + 46.3;

    var livingIndex = Math.floor(100 - 3 * Math.abs(base - discomfortIndex));

    if (livingIndex < 0) {
        livingIndex = 0;
    } else if (livingIndex > 100) {
        livingIndex = 100;
    }

    if (discomfortIndex <= 55) {
        message = "今日はとても寒そう..";
    } else if (discomfortIndex > 55 && discomfortIndex <= 60) {
        message = "少し肌寒いかも..";
    } else if (discomfortIndex > 60 && discomfortIndex <= 65) {
        message = "今日は一般的な日になりそう";
    } else if (discomfortIndex > 65 && discomfortIndex <= 70) {
        message = "今日は快適な1日になりそう！";
    } else if (discomfortIndex > 70 && discomfortIndex <= 75) {
        message = "そんなに暑くないかも..";
    } else if (discomfortIndex > 75 && discomfortIndex <= 80) {
        message = "今日はやや暑い日になりそう";
    } else if (discomfortIndex > 80 && discomfortIndex <= 85) {
        message = "暑くて汗がでちゃいそう";
    } else if (discomfortIndex > 85) {
        message = "暑くて暑くてたまらない";
    }

    setLivingIndex(livingIndex, message);
}
function setLivingIndex(livingIndex, message) {
    $("#living-index").html(livingIndex);
    $("#living-desc").html(message);
}
function processDryness(effHumidity, minHumidity) {
    var message = "";

    if ((effHumidity <= 65) && (minHumidity <= 40)) {
        message = "乾燥注意報発令中火災に注意！！";
    }
    else {
        message = "今日はあまり乾燥してないみたい";
    }

    setDryness(message);
}
function setDryness(message) {
    $("#dry-desc").html(message);
}
function setRainyPercentage(percentage) {
    $("#raining-desc").html(percentage);
}
function setCurrentSmileLevel(level) {
    $("#smile-data").html(level);
}
function setSmileBoxLevel(level) {
    $("#smile-desc").html(level);
}
function setEnvironmentalDesc(index) {
    $("#environmental-index").html(index);
}
