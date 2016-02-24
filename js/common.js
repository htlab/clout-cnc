var livingImage = '../img/living.png';
var livingSummary = 'Living index means how people can live comfortably. 70 is most comfortable.';

//var drivingImage = '../img/drive.png';
//var drivingSummary = 'Driving index means recoomendation value of driving a car. The higher, the more suitable.';

var washingImage = '../img/washing.png';
var washingSummary = 'Washing index means recoomendation value of washing a cloth. The higher, more suitable.';

var dryImage = '../img/dry.png';
var drySummary = 'Dry index means how dryness of the air. Show dryness according to the humidity sensor.';

var rainingImage = '../img/raining.png';
var rainingSummary = 'Raining rate shows current raining rate. This is real time information from the sensor.';

function onGoodButtonClicked(){
    $('#box_thanks').fadeIn('slow',function(){
        $("#box_thanks").get(0).scrollIntoView(true)
        setTimeout(function(){
            publishSmileLevel();
        }, 1000);
    });
}

function initialize(){
    setLivingSummary(livingSummary);
//    setLivingImage(livingImage);
//    setDrivingSummary(drivingSummary);
//    setDrivingImage(drivingImage);
    setWashingSummary(washingSummary);
//    setWashingImage(washingImage);
    setDrySummary(drySummary);
//    setDryImage(dryImage);
    setRainingSummary(rainingSummary);
//    setRainingImage(rainingImage);
}

function setSoxParams(temperature, windspeed, humidity, rainfall){
    setDryIndex(humidity);
    setRainingRate(rainfall);
    setLivingIndex(temperature, humidity);
    setWashingIndex(temperature, humidity, rainfall, windspeed);
}

function setLivingIndex(temperature, humidity){
    var base = 70;
    var discomfort_index = 0.81 * Number(temperature) + 0.01 * Number(humidity) * (0.99 * Number(temperature) - 14.3) + 46.3;
    var life_index = Math.ceil(100 - 3 * Math.abs(base - discomfort_index));
    var message;

    $("#living .data-area p").removeClass();
    if (discomfort_index <= 55){
        /*
        message = '<h3 class="moderate">Living Index: ' + life_index + '</h3>';
        message += 'It is too cold today...';
        */
        $("#living .data-area p").addClass("moderate");
        message = 'It is too cold today...';

    } else if (discomfort_index > 55 && discomfort_index <= 60){
        /*
        message = '<h3 class="moderate">Living Index: ' + life_index + '</h3>';
        message += 'It is a bit cold today..';
        */
        $("#living .data-area p").addClass("moderate");
        message = 'It is a bit cold today..';
    } else if (discomfort_index > 60 && discomfort_index <= 65){
        /*
        message = '<h3 class="normal">Living Index: ' + life_index + '</h3>';
        message += 'It is a normal day.';
        */
        $("#living .data-area p").addClass("normal");
        message = 'It is a normal day.';
    } else if (discomfort_index > 65 && discomfort_index <= 70){
        /*
        message = '<h3 class="normal">Living Index: ' + life_index + '</h3>';
        message += 'It is a nice day!';
        */
        $("#living .data-area p").addClass("normal");
        message = 'It is a nice day!';
    } else if (discomfort_index > 70 && discomfort_index <= 75){
        /*
        message = '<h3 class="warning">Living Index: ' + life_index + '</h3>';
        message += 'You would feel a bit hot today.';
        */
        $("#living .data-area p").addClass("warning");
        message = 'You would feel a bit hot today.';
    } else if (discomfort_index > 75 && discomfort_index <= 80){
        /*
        message = '<h3 class="warning">Living Index: ' + life_index + '</h3>';
        message += 'It is a  bit hot today..';
        */
        $("#living .data-area p").addClass("warning");
        message = 'It is a  bit hot today..';
    } else if (discomfort_index > 80 && discomfort_index <= 85){
        /*
        message = '<h3 class="important">Living Index: ' + life_index + '</h3>';
        message += 'It is HOT today.';
        */
        $("#living .data-area p").addClass("important");
        message = 'It is HOT today.';
    } else if (discomfort_index > 85){
        /*
        message = '<h3 class="important">Living Index: ' + life_index + '</h3>';
        message += 'It is too much hot today....';
        */
        $("#living .data-area p").addClass("important");
        message = 'It is too much hot today....';
    }
    
    setLivingMessage(life_index, message);
}

function setWashingIndex(temperature, humidity, rainfall, windspeed){
    var averageTemperature = getAverageTemperature();
    var averageHumidity = getAverageHumidity();

    var rainfallParam = 1.5;
    var humidityParam = 1.5;
    var temperatureParam = 0.8;
    var windParam = 1;

    index = 100 - (Number(rainfall) * rainfallParam) - (( Number(humidity) - averageHumidity) * humidityParam) + (( Number(temperature) - averageTemperature) * temperatureParam) + (Number(windspeed) * windParam);

    if (index > 100){
        index = 100;
    } else if (index < 0){
        index = 0;
    }

    index = Math.floor(index * 10) / 10;

    var message;

    $("#washing div.data-area p").removeClass();
    if (index <= 30){
        /*
        message = '<h3 class="moderate">Washing Index: ' + index + '</h3>';
        message += 'Let\'s dry clothes in your room';
        */
        $("#washing .data-area p").addClass("moderate");
        message = 'Let\'s dry clothes in your room';
    } else if (index > 30 && index <= 50){
        /*
        message = '<h3 class="normal">Washing Index: ' + index + '</h3>';
        message += 'if it rains, a bit dangerous..';
        */
        $("#washing .data-area p").addClass("normal");
        message = 'if it rains, a bit dangerous..';
    } else if (index > 50 && index <= 70){
        /*
        message = '<h3 class="normal">Washing Index: ' + index + '</h3>';
        message += 'It\'s a normal day for washing.';
        */
        $("#washing .data-area p").addClass("normal");
        message = 'It\'s a normal day for washing.';
    } else if (index > 70 && index <= 80){
        /*
        message = '<h3 class="warning">Washing Index: ' + index + '</h3>';
        message += 'Clothes will get dry.';
        */
        $("#washing .data-area p").addClass("warning");
        message = 'Clothes will get dry.';
    } else if (index > 80){
        /*
        message = '<h3 class="warning">Washing Index: ' + index + '</h3>';
        message += 'Today is wonderful day for washing!!';
        */
        $("#washing .data-area p").addClass("warning");
        message = 'Today is wonderful day for washing!!';
    }

    setWashingMessage(index, message);
}

function setDryIndex(humidity){
    var value = Number(humidity);
    var message;

    $("#dry div.data-area").attr("class", "data-area");
    if (value < 40){
        // message = '<h3 class="important">Dryness is high. <br> Take care of the fire.</h3>';
        $("#dry .data-area").addClass("important");
        message = 'Dryness is high. <br> Take care of the fire.';
    } else if ( value < 70 ){
        // message = '<h3 class="normal">Dryness is normal. <br> Let\'s hang out!</h3>';
        $("#dry .data-area").addClass("normal");
        message = 'Dryness is normal. <br> Let\'s hang out!';
    } else {
        // message = '<h3 class="moderate">Dryness is low. <br> So Humid.</h3>';
        $("#dry .data-area").addClass("moderate");
        message = 'Dryness is low. <br> So Humid.';
    }

    setDryMessage(message);
}

function setRainingRate(rainfall){
    var value = Number(rainfall);
    var message;

    $("#raining-rate div.data-area").attr("class", "data-area");
    if (value < 20){
        // message = '<h1 class="moderate">' + rainfall + '% <h1>';
        $("#raining-rate .data-area").addClass("moderate");
    } else if (value < 40){
        // message = '<h1 class="normal">' + rainfall + '% <h1>';
        $("#raining-rate .data-area").addClass("normal");
    } else if (value < 70){
        // message = '<h1 class="warning">' + rainfall + '% <h1>';
        $("#raining-rate .data-area").addClass("warning");
    } else {
        // message = '<h1 class="important">' + rainfall + '% <h1>';
        $("#raining-rate .data-area").addClass("important");
    }
    
    setRainingMessage(rainfall);
}

function goResultPage(){
    location.replace("http://sox.ht.sfc.keio.ac.jp/~richie/mobile/santander/");
}

function setLivingSummary(summary){
    $("#living_summary").html(summary);
}

function setLivingImage(url){
    $("#living_img").html('<img src=\"' + url + '\">');
}

function setLivingMessage(life_index, message){
    // $("#living_message").html(message);
    $('#living-index').html(life_index);
    $('#living-desc').html(message);
}

//function setDrivingSummary(summary){
//    $("#driving_summary").html(summary);
//}
//
//function setDrivingImage(url){
//    $("#driving_img").html('<img src=\"' + url + '\">');
//}
//
//function setDrivingMessage(message){
//    $("#driving_message").html(message);
//}

function setWashingSummary(summary){
    $("#washing_summary").html(summary);
}

function setWashingImage(url){
    $("#washing_img").html('<img src=\"' + url + '\">');
}

function setWashingMessage(index, message){
    $('#washing-index').html(index);
    $("#washing-desc").html(message);
}

function setDrySummary(summary){
    $("#dry_summary").html(summary);
}

function setDryImage(url){
    $("#dry_img").html('<img src=\"' + url + '\">');
}

function setDryMessage(message){
    $("#dry-desc").html(message);
}

function setRainingSummary(summary){
    $("#raining_summary").html(summary);
}

function setRainingImage(url){
    $("#raining_img").html('<img src=\"' + url + '\">');
}

function setRainingMessage(message){
    $("#raining-desc").html(message);
}

function setCurrentSmileLevel(level) {
    $("#smile-data").html(level);
}
