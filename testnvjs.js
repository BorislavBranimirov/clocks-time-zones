var itemTimeZoneArr = [];
var itemColorArr = [];
var longestTimeZoneLength = 0;
var elementForColorChange = null;//change to null everytime item color div is closed
var hoveredPreviousColor = null;//changed to null on mouse out and clicked(so as not to return previous color)

window.onload = function() {
  loadTimeZoneSelect();
  loadSettings();
  loadClocks();
  onloadEvents();

  updateTime();
  setInterval(updateTime, 1000);
  gridTextFix();
}

window.onunload = function() {
  localStorage.setItem("timeZones", JSON.stringify(itemTimeZoneArr));
  localStorage.setItem("colors", JSON.stringify(itemColorArr));
  localStorage.setItem("monthText", JSON.stringify(document.getElementById("month-text-id").checked));
  localStorage.setItem("hideDate", JSON.stringify(document.getElementById("hide-date-id").checked));
  localStorage.setItem("meridiem", JSON.stringify(document.getElementById("meridiem-id").checked));
  localStorage.setItem("dateFormat", document.getElementById("format-select").options[document.getElementById("format-select").selectedIndex].text);
}

function onloadEvents() {
  document.getElementById("open-menu-btn").addEventListener(
    "click", showMenu
  );
  document.getElementById("color-chosen").addEventListener(
      "click", function() {
        let colorDiv = document.getElementById("color-div");
        colorDiv.style.display = (colorDiv.style.display === "none") ? "block" : "none";
      }
  );
  for(let i = 0; i < document.getElementsByClassName("color-option").length; i++) {
    document.getElementsByClassName("color-option")[i].addEventListener(
        "click", function() {
          let colorList = document.querySelectorAll(".color-option");
          document.getElementById("color-chosen").style.backgroundColor = colorList[i].style.backgroundColor;
        });
  }
  document.getElementById("create-item-btn").addEventListener(
      "click", function() {
        let timeZoneDataListOptions = document.getElementById("time-zone-select").options;
        let createResult = false;
        for(let i = 0; i < timeZoneDataListOptions.length; i++) {
          if(timeZoneDataListOptions[i].value.toLowerCase() === document.getElementById("time-zone-input").value.toLowerCase()) {
            createResult = true;
            document.getElementById("time-zone-input").value = timeZoneDataListOptions[i].value;
            break;
          }
        }
        if(createResult == true) {
          if(document.getElementById("time-zone-input").value === "Local") {
            newLocalClock();
          } else {
            newClock();
          }
        } else alert("Invalid Time Zone");
  });
  document.getElementById("close-grid-item-color-div").addEventListener(
    "click", function() {
      document.getElementById("grid-item-color-div").style.display = "none";
      elementForColorChange = null;
    }
  );
  for(let i = 0; i < document.getElementsByClassName("grid-item-color-option").length; i++) {
    let colorOptions = document.getElementsByClassName("grid-item-color-option");
    colorOptions[i].addEventListener(
        "click", function() {
          changeItemColor(colorOptions[i].style.backgroundColor)
          hoveredPreviousColor = null;
        }
    );
    colorOptions[i].addEventListener(
      "mouseover", function() {
        hoveredPreviousColor = elementForColorChange.style.backgroundColor;
        changeItemColorTemporary(colorOptions[i].style.backgroundColor);
      }
    );
    colorOptions[i].addEventListener(
      "mouseout", function() {
        if(hoveredPreviousColor) {
        changeItemColorTemporary(hoveredPreviousColor);
        hoveredPreviousColor = null;
        }
      }
    );
  }
  document.getElementById("grid-item-color-div").addEventListener
  document.getElementById("month-text-id").addEventListener(
      "change", function() { 
        updateTime();
        gridTextFix();
  });
  document.getElementById("hide-date-id").addEventListener(
      "change", function() {
        updateTime();
        gridTextFix();
  });
  document.getElementById("meridiem-id").addEventListener(
      "change", function() { 
        updateTime();
        gridTextFix();
  });
  document.getElementById("format-select").addEventListener(
      "change", function() {
        updateTime(); 
        gridTextFix();
  });
  window.addEventListener(
      "resize", function() {
        gridTextFix();
  });
}

function changeItemColor(color) {
  elementForColorChange.style.backgroundColor = color;
  elementForColorChange.getElementsByClassName("grid-item-color-btn")[0].style.backgroundColor = color;
  elementForColorChange.getElementsByClassName("grid-item-color-btn")[0].style.color = color;
  let removeIndex;
  for (removeIndex = 0; removeIndex < document.getElementsByClassName("grid-item").length; removeIndex++) {
    if (document.getElementsByClassName("grid-item")[removeIndex] === elementForColorChange) break;
  }
  itemColorArr.splice(removeIndex, 1);
  itemColorArr.splice(removeIndex, 0, color);
}

//not saved to global array and local storage, wears of on page restart
function changeItemColorTemporary(color) {
  elementForColorChange.style.backgroundColor = color;
  elementForColorChange.getElementsByClassName("grid-item-color-btn")[0].style.backgroundColor = color;
  elementForColorChange.getElementsByClassName("grid-item-color-btn")[0].style.color = color;
}

function updateTime() {
  var container = document.getElementById("grid-container");
  var textMonthB = document.getElementById("month-text-id").checked;
  var hideDateB = document.getElementById("hide-date-id").checked;
  var meridiemB = document.getElementById("meridiem-id").checked;
  var formatSelect = document.getElementById("format-select").options[document.getElementById("format-select").selectedIndex];
  var i;
  for(i = 0; i < container.children.length; i++) {
    if(itemTimeZoneArr[i]==="Local") {
      document.getElementsByClassName("clock")[i].innerHTML = parseCurrentDateLocalStringHtml(textMonthB, hideDateB, meridiemB, formatSelect.text);
    } else {
      document.getElementsByClassName("clock")[i].innerHTML = parseCurrentDateStringHtml(itemTimeZoneArr[i], textMonthB, hideDateB, meridiemB, formatSelect.text);
    }
  }
  //container.childNodes[container.children.length-1].classList.add("last-item");
}

function loadSettings() {
  if(localStorage.getItem("monthText")) {
    document.getElementById("month-text-id").checked = JSON.parse(localStorage.getItem("monthText"));
  }
  if(localStorage.getItem("hideDate")) {
    document.getElementById("hide-date-id").checked = JSON.parse(localStorage.getItem("hideDate"));
  }
  if(localStorage.getItem("meridiem")) {
    document.getElementById("meridiem-id").checked = JSON.parse(localStorage.getItem("meridiem"));
  }
  if(localStorage.getItem("dateFormat")) {
    document.getElementById("format-select").value = localStorage.getItem("dateFormat");
  }
  //otherwise it considers display property empty, even thought it is in stylesheet(?)
  document.getElementById("color-div").style.display = "none";
  document.getElementById("grid-item-color-div").style.display = "none";
}

function loadClocks() {
  //make vars for checked states and pass them, or take them from locale storage directly?
  //or get rid of the method as a whole and check in newClock func itself
  
  //if timezones are saved in storage, load them, else create a new local clock
  if((localStorage.getItem("timeZones") && localStorage.getItem("timeZones") !== "[]") &&
      (localStorage.getItem("colors") && localStorage.getItem("colors") !== "[]")) {
    //populate a new array to asign to itemTimeZoneArr at the end, otherwise the newClock funcs with keep on populating it causing an infinite loop
    var tzArr = JSON.parse(localStorage.getItem("timeZones"));
    var colorArr = JSON.parse(localStorage.getItem("colors"));
    var i;
    for(i = 0; i < tzArr.length; i++) {
      if(tzArr[i] === "Local") {
        newLocalClock(colorArr[i]);
      } else {
        newClock(colorArr[i], tzArr[i]);
      } 
    }
    itemTimeZoneArr = tzArr;
    itemColorArr = colorArr;
  } else {
    newLocalClock();
  }
}

function loadTimeZoneSelect() {
  var str = "Local Africa/Abidjan Africa/Accra Africa/Addis_Ababa Africa/Algiers Africa/Asmara Africa/Bamako Africa/Bangui Africa/Banjul Africa/Bissau Africa/Blantyre Africa/Brazzaville Africa/Bujumbura Africa/Cairo Africa/Casablanca Africa/Ceuta Africa/Conakry Africa/Dakar Africa/Dar_es_Salaam Africa/Djibouti Africa/Douala Africa/El_Aaiun Africa/Freetown Africa/Gaborone Africa/Harare Africa/Johannesburg Africa/Juba Africa/Kampala Africa/Khartoum Africa/Kigali Africa/Kinshasa Africa/Lagos Africa/Libreville Africa/Lome Africa/Luanda Africa/Lubumbashi Africa/Lusaka Africa/Malabo Africa/Maputo Africa/Maseru Africa/Mbabane Africa/Mogadishu Africa/Monrovia Africa/Nairobi Africa/Ndjamena Africa/Niamey Africa/Nouakchott Africa/Ouagadougou Africa/Porto-Novo Africa/Sao_Tome Africa/Timbuktu Africa/Tripoli Africa/Tunis Africa/Windhoek America/AdakAmerica/Anchorage America/Anguilla America/Antigua America/Araguaina America/Argentina/Buenos_Aires America/Argentina/Catamarca America/Argentina/ComodRivadavia America/Argentina/Cordoba America/Argentina/Jujuy America/Argentina/La_Rioja America/Argentina/Mendoza America/Argentina/Rio_Gallegos America/Argentina/Salta America/Argentina/San_Juan America/Argentina/San_Luis America/Argentina/Tucuman America/Argentina/Ushuaia America/Aruba America/Asuncion America/Atikokan America/Atka America/Bahia America/Bahia_Banderas America/Barbados America/Belem America/Belize America/Blanc-Sablon America/Boa_Vista America/Bogota America/Boise America/Buenos_Aires America/Cambridge_Bay America/Campo_Grande America/Cancun America/Caracas America/Catamarca America/Cayenne America/Cayman America/Chicago America/Chihuahua America/Coral_Harbour America/Cordoba America/Costa_Rica America/Creston America/Cuiaba America/Curacao America/Danmarkshavn America/Dawson America/Dawson_Creek America/Denver America/Detroit America/Dominica America/Edmonton America/Eirunepe America/El_Salvador America/Ensenada America/Fort_Nelson America/Fort_Wayne America/Fortaleza America/Glace_Bay America/Godthab America/Goose_Bay America/Grand_Turk America/Grenada America/Guadeloupe America/Guatemala America/Guayaquil America/Guyana America/Halifax America/Havana America/Hermosillo America/Indiana/Indianapolis America/Indiana/Knox America/Indiana/Marengo America/Indiana/Petersburg America/Indiana/Tell_City America/Indiana/Vevay America/Indiana/Vincennes America/Indiana/Winamac America/Indianapolis America/Inuvik America/Iqaluit America/Jamaica America/Jujuy America/Juneau America/Kentucky/Louisville America/Kentucky/Monticello America/Knox_IN America/Kralendijk America/La_Paz America/Lima America/Los_Angeles America/Louisville America/Lower_Princes America/Maceio America/Managua America/Manaus America/Marigot America/Martinique America/Matamoros America/Mazatlan America/Mendoza America/Menominee America/Merida America/Metlakatla America/Mexico_City America/Miquelon America/Moncton America/Monterrey America/Montevideo America/Montreal America/Montserrat America/Nassau America/New_York America/Nipigon America/Nome America/Noronha America/North_Dakota/Beulah America/North_Dakota/Center America/North_Dakota/New_Salem America/Ojinaga America/Panama America/Pangnirtung America/Paramaribo America/Phoenix America/Port-au-Prince America/Port_of_Spain America/Porto_Acre America/Porto_Velho America/Puerto_Rico America/Punta_Arenas America/Rainy_River America/Rankin_Inlet America/Recife America/Regina America/Resolute America/Rio_Branco America/Rosario America/Santa_Isabel America/Santarem America/Santiago America/Santo_Domingo America/Sao_Paulo America/Scoresbysund America/Shiprock America/Sitka America/St_Barthelemy America/St_Johns America/St_Kitts America/St_Lucia America/St_Thomas America/St_Vincent America/Swift_Current America/Tegucigalpa America/Thule America/Thunder_Bay America/Tijuana America/Toronto America/Tortola America/Vancouver America/Virgin America/Whitehorse America/Winnipeg America/Yakutat America/Yellowknife Antarctica/Casey Antarctica/Davis Antarctica/DumontDUrville Antarctica/Macquarie Antarctica/Mawson Antarctica/McMurdo Antarctica/Palmer Antarctica/Rothera Antarctica/South_Pole Antarctica/Syowa Antarctica/Troll Antarctica/Vostok Arctic/Longyearbyen Asia/Aden Asia/Almaty Asia/Amman Asia/Anadyr Asia/Aqtau Asia/Aqtobe Asia/Ashgabat Asia/Ashkhabad Asia/Atyrau Asia/Baghdad Asia/Bahrain Asia/Baku Asia/Bangkok Asia/Barnaul Asia/Beirut Asia/Bishkek Asia/Brunei Asia/Calcutta Asia/Chita Asia/Choibalsan Asia/Chongqing Asia/Chungking Asia/Colombo Asia/Dacca Asia/Damascus Asia/Dhaka Asia/Dili Asia/Dubai Asia/Dushanbe Asia/Famagusta Asia/Gaza Asia/Harbin Asia/Hebron Asia/Ho_Chi_Minh Asia/Hong_Kong Asia/Hovd Asia/Irkutsk Asia/Istanbul Asia/Jakarta Asia/Jayapura Asia/Jerusalem Asia/Kabul Asia/Kamchatka Asia/Karachi Asia/Kashgar Asia/Kathmandu Asia/Katmandu Asia/Khandyga Asia/Kolkata Asia/Krasnoyarsk Asia/Kuala_Lumpur Asia/Kuching Asia/Kuwait Asia/Macao Asia/Macau Asia/Magadan Asia/Makassar Asia/Manila Asia/Muscat Asia/Nicosia Asia/Novokuznetsk Asia/Novosibirsk Asia/Omsk Asia/Oral Asia/Phnom_Penh Asia/Pontianak Asia/Pyongyang Asia/Qatar Asia/Qyzylorda Asia/Rangoon Asia/Riyadh Asia/Saigon Asia/Sakhalin Asia/Samarkand Asia/Seoul Asia/Shanghai Asia/Singapore Asia/Srednekolymsk Asia/Taipei Asia/Tashkent Asia/Tbilisi Asia/Tehran Asia/Tel_Aviv Asia/Thimbu Asia/Thimphu Asia/Tokyo Asia/Tomsk Asia/Ujung_Pandang Asia/Ulaanbaatar Asia/Ulan_Bator Asia/Urumqi Asia/Ust-Nera Asia/Vientiane Asia/Vladivostok Asia/Yakutsk Asia/Yangon Asia/Yekaterinburg Asia/Yerevan Atlantic/Azores Atlantic/Bermuda Atlantic/Canary Atlantic/Cape_Verde Atlantic/Faeroe Atlantic/Faroe Atlantic/Jan_Mayen Atlantic/Madeira Atlantic/Reykjavik Atlantic/South_Georgia Atlantic/St_Helena Atlantic/Stanley Australia/ACT Australia/Adelaide Australia/Brisbane Australia/Broken_Hill Australia/Canberra Australia/Currie Australia/Darwin Australia/Eucla Australia/Hobart Australia/LHI Australia/Lindeman Australia/Lord_Howe Australia/Melbourne Australia/North Australia/NSW Australia/Perth Australia/Queensland Australia/South Australia/Sydney Australia/Tasmania Australia/Victoria Australia/West Australia/Yancowinna Brazil/Acre Brazil/DeNoronha Brazil/East Brazil/West Canada/Atlantic Canada/Central Canada/Eastern Canada/Mountain Canada/Newfoundland Canada/Pacific Canada/Saskatchewan Canada/Yukon CET Chile/Continental Chile/EasterIsland CST6CDT Cuba EET Egypt Eire EST EST5EDT Etc/GMT Etc/GMT+0 Etc/GMT+1 Etc/GMT+10 Etc/GMT+11 Etc/GMT+12 Etc/GMT+2 Etc/GMT+3 Etc/GMT+4 Etc/GMT+5 Etc/GMT+6 Etc/GMT+7 Etc/GMT+8 Etc/GMT+9 Etc/GMT-0 Etc/GMT-1 Etc/GMT-10 Etc/GMT-11 Etc/GMT-12 Etc/GMT-13 Etc/GMT-14 Etc/GMT-2 Etc/GMT-3 Etc/GMT-4 Etc/GMT-5 Etc/GMT-6 Etc/GMT-7 Etc/GMT-8 Etc/GMT-9 Etc/GMT0 Etc/Greenwich Etc/UCT Etc/Universal Etc/UTC Etc/Zulu Europe/Amsterdam Europe/Andorra Europe/Astrakhan Europe/Athens Europe/Belfast Europe/Belgrade Europe/Berlin Europe/Bratislava Europe/Brussels Europe/Bucharest Europe/Budapest Europe/Busingen Europe/Chisinau Europe/Copenhagen Europe/Dublin Europe/Gibraltar Europe/Guernsey Europe/Helsinki Europe/Isle_of_Man Europe/Istanbul Europe/Jersey Europe/Kaliningrad Europe/Kiev Europe/Kirov Europe/Lisbon Europe/Ljubljana Europe/London Europe/Luxembourg Europe/Madrid Europe/Malta Europe/Mariehamn Europe/Minsk Europe/Monaco Europe/Moscow Europe/Nicosia Europe/Oslo Europe/Paris Europe/Podgorica Europe/Prague Europe/Riga Europe/Rome Europe/Samara Europe/San_Marino Europe/Sarajevo Europe/Saratov Europe/Simferopol Europe/Skopje Europe/Sofia Europe/Stockholm Europe/Tallinn Europe/Tirane Europe/Tiraspol Europe/Ulyanovsk Europe/Uzhgorod Europe/Vaduz Europe/Vatican Europe/Vienna Europe/Vilnius Europe/Volgograd Europe/Warsaw Europe/Zagreb Europe/Zaporozhye Europe/Zurich GB GB-Eire GMT GMT+0 GMT0 GMT−0 Greenwich Hongkong HST Iceland Indian/Antananarivo Indian/Chagos Indian/Christmas Indian/Cocos Indian/Comoro Indian/Kerguelen Indian/Mahe Indian/Maldives Indian/Mauritius Indian/Mayotte Indian/Reunion Iran Israel Jamaica Japan Kwajalein Libya MET Mexico/BajaNorte Mexico/BajaSur Mexico/General MST MST7MDT Navajo NZ NZ-CHAT Pacific/Apia Pacific/Auckland Pacific/Bougainville Pacific/Chatham Pacific/Chuuk Pacific/Easter Pacific/Efate Pacific/Enderbury Pacific/Fakaofo Pacific/Fiji Pacific/Funafuti Pacific/Galapagos Pacific/Gambier Pacific/Guadalcanal Pacific/Guam Pacific/Honolulu Pacific/Johnston Pacific/Kiritimati Pacific/Kosrae Pacific/Kwajalein Pacific/Majuro Pacific/Marquesas Pacific/Midway Pacific/Nauru Pacific/Niue Pacific/Norfolk Pacific/Noumea Pacific/Pago_Pago Pacific/Palau Pacific/Pitcairn Pacific/Pohnpei Pacific/Ponape Pacific/Port_Moresby Pacific/Rarotonga Pacific/Saipan Pacific/Samoa Pacific/Tahiti Pacific/Tarawa Pacific/Tongatapu Pacific/Truk Pacific/Wake Pacific/Wallis Pacific/Yap Poland Portugal PRC PST8PDT ROC ROK Singapore Turkey UCT Universal US/Alaska US/Aleutian US/Arizona US/Central US/East-Indiana US/Eastern US/Hawaii US/Indiana-Starke US/Michigan US/Mountain US/Pacific US/Pacific-New US/Samoa UTC W-SU WET Zulu";
  var arr = str.split(" ");
  var timeZoneSelect = document.getElementById("time-zone-select");
  var i;
  for(i = 0; i < arr.length; i++) {
    
    if(arr[i].slice(arr[i].lastIndexOf("/") + 1).length>longestTimeZoneLength) longestTimeZoneLength=arr[i].slice(arr[i].lastIndexOf("/") + 1).length;

    let option = document.createElement("option");
    option.value = arr[i];
    timeZoneSelect.appendChild(option);
  }
}

function showMenu() {
  document.getElementById("menu-id").classList.toggle("show");
  document.getElementById("btn-icon").classList.toggle("fa-chevron-right");
  document.getElementById("btn-icon").classList.toggle("fa-chevron-left");
}

function leadingZero(i) {
  if(i < 10) {i="0" + i;}
  return i;
}

//date object
//IANA timeZones
//boolTextMonth: true - display month as text, false - display month as number
//boolHideDate: true - display only hours, minutes, seconds and hide date
//boolMeridiem: true - 12 hour clock, false - 24 hour clock
//format is a string "DDMMYYYY", "MMDDYYYY" or "YYYYMMDD"
function parseDateStringHtml(date, timeZone, boolTextMonth = true, boolHideDate = false, boolMeridiem = false, format = "DDMMYYYY") {
  /*try {
    if(Object.prototype.toString.call(date) !== '[object Date]') throw "Error: No date object passed to parsing function.";
    //check for timeZone
    if(typeof(boolTextMonth) !== "boolean") throw "Error: No TextMonth bool passed to parsing function.";
    if(typeof(boolHideDate) !== "boolean") throw "Error: No HideDate bool passed to parsing function.";
    if(typeof(boolMeridiem) !== "boolean") throw "Error: No Meridiem bool passed to parsing function."
    if(format !== "DDMMYYYY" && format !== "MMDDYYYY" && format !== "YYYYMMDD") {
      throw "Error: wrong format passed to parsing function. Use DDMMYYYY, MMDDYYYY or YYYYMMDD.";
    }
  }
  catch (err) {
    console.error(err);
    return "Error";
  }*/
  var time = date.toLocaleString("en-US", {
      timeZone: timeZone, hour12: false,
      weekday: "long", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",});
  var arr = time.split(/, |\/|:/);//split on ", " or "/" or ":"
  var weekday = arr[0];
  var month = parseInt(arr[1]);
  if(boolTextMonth === true) {
  switch(month){
    case 1: 
      month = "Jan";
      break;
    case 2:
      month = "Feb";
      break;
    case 3:
      month = "Mar";
      break;
    case 4:
      month = "Apr";
      break;
    case 5:
      month = "May";
      break;
    case 6:
      month = "Jun";
      break;
    case 7:
      month = "Jul";
      break;
    case 8:
      month = "Aug";
      break;
    case 9:
      month = "Sept";
      break;
    case 10:
      month = "Oct";
      break;
    case 11:
      month = "Nov";
      break;
    case 12:
      month = "Dec";
  }
  }
  var day = arr[2];
  var year = arr[3];
  var hour = arr[4];
  var meridiem = "";
  if(boolMeridiem === true) {
    meridiem = " AM";
    let h = parseInt(hour);
    if(h > 12) {
      hour = leadingZero(h - 12);
      meridiem = " PM";
    }
    if(h === 0) {
      hour = 12;
    }
  }
  var minute = arr[5];
  var second = arr[6];
  var timeStr;
  var dateInOrder; //string with day month and year with spaces in the format order
  if(format === "DDMMYYYY") {
    dateInOrder = day + " " + month + " " + year;
  }
  if(format === "MMDDYYYY") {
    dateInOrder = month + " " + day + " " + year;
  }
  if(format === "YYYYMMDD") {
    dateInOrder = year + " " + month + " " + day;
  }
  //if timeZone has "/" take the rest of the string, else indexOf returns -1 ->slice starts from index 0
  var place = timeZone.slice(timeZone.lastIndexOf("/") + 1);
  if(boolHideDate === true) {
    timeStr = 
        place + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  } else {
      timeStr = 
        place + "<br>" +
        weekday + "<br>" +
        dateInOrder + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  }
  return timeStr;
}

//IANA timeZones
//boolTextMonth: true - display month as text, false - display month as number
//boolHideDate: true - display only hours, minutes, seconds and hide date
//boolMeridiem: true - 12 hour clock, false - 24 hour clock
//format is a string "DDMMYYYY", "MMDDYYYY" or "YYYYMMDD"
function parseCurrentDateStringHtml(timeZone, boolTextMonth = true, boolHideDate = false, boolMeridiem = false, format = "DDMMYYYY") {
  /*try {
    //check for timeZone
    if(typeof(boolTextMonth) !== "boolean") throw "Error: No TextMonth bool passed to parsing function.";
    if(typeof(boolHideDate) !== "boolean") throw "Error: No HideDate bool passed to parsing function.";
    if(typeof(boolMeridiem) !== "boolean") throw "Error: No Meridiem bool passed to parsing function."
    if(format !== "DDMMYYYY" && format !== "MMDDYYYY" && format !== "YYYYMMDD") {
      throw "Error: wrong format passed to parsing function. Use DDMMYYYY, MMDDYYYY or YYYYMMDD.";
    }
  }
  catch (err) {
    console.error(err);
    return "Error";
  }*/
  var date = new Date();
  var time = date.toLocaleString("en-US", {
      timeZone: timeZone, hour12: false,
      weekday: "long", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",});
  var arr = time.split(/, |\/|:/);//split on ", " or "/" or ":"
  var weekday = arr[0];
  var month = parseInt(arr[1]);
  if(boolTextMonth === true) {
  switch(month){
    case 1: 
      month = "Jan";
      break;
    case 2:
      month = "Feb";
      break;
    case 3:
      month = "Mar";
      break;
    case 4:
      month = "Apr";
      break;
    case 5:
      month = "May";
      break;
    case 6:
      month = "Jun";
      break;
    case 7:
      month = "Jul";
      break;
    case 8:
      month = "Aug";
      break;
    case 9:
      month = "Sep";
      break;
    case 10:
      month = "Oct";
      break;
    case 11:
      month = "Nov";
      break;
    case 12:
      month = "Dec";
  }
  }
  var day = arr[2];
  var year = arr[3];
  var hour = arr[4];
  var meridiem = "";
  if(boolMeridiem === true) {
    meridiem = " AM";
    var h = parseInt(hour);
    if(h > 12) {
      hour = leadingZero(h - 12);
      meridiem = " PM";
    }
    if(h === 0) {
      hour = 12;
    }
  }
  var minute = arr[5];
  var second = arr[6];
  var timeStr;
  var dateInOrder; //string with day month and year with spaces in the format order
  if(format === "DDMMYYYY") {
    dateInOrder = day + " " + month + " " + year;
  }
  if(format === "MMDDYYYY") {
    dateInOrder = month + " " + day + " " + year;
  }
  if(format === "YYYYMMDD") {
    dateInOrder = year + " " + month + " " + day;
  }
  //if timeZone has "/" take the rest of the string, else indexOf returns -1 ->slice starts from index 0
  //console.log(timeZone);
  var place = timeZone.slice(timeZone.lastIndexOf("/") + 1);
  //console.log(place);
  if(boolHideDate === true) {
    timeStr = 
        place + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  } else {
      timeStr = 
        place + "<br>" +
        weekday + "<br>" +
        dateInOrder + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  }
  return timeStr;
}

//boolTextMonth: true - display month as text, false - display month as number
//boolHideDate: true - display only hours, minutes, seconds and hide date
//boolMeridiem: true - 12 hour clock, false - 24 hour clock
//format is a string "DDMMYYYY", "MMDDYYYY" or "YYYYMMDD"
function parseCurrentDateLocalStringHtml(boolTextMonth = true, boolHideDate = false, boolMeridiem = false, format = "DDMMYYYY") {
  /*try {
    if(typeof(boolTextMonth) !== "boolean") throw "Error: No TextMonth bool passed to parsing function.";
    if(typeof(boolHideDate) !== "boolean") throw "Error: No HideDate bool passed to parsing function.";
    if(typeof(boolMeridiem) !== "boolean") throw "Error: No Meridiem bool passed to parsing function."
    if(format !== "DDMMYYYY" && format !== "MMDDYYYY" && format !== "YYYYMMDD") {
      throw "Error: wrong format passed to parsing function. Use DDMMYYYY, MMDDYYYY or YYYYMMDD.";
    }
  }
  catch (err) {
    console.error(err);
    return "Error";
  }*/
  var date = new Date();
  var time = date.toLocaleString("en-US", {
      hour12: false,
      weekday: "long", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",});
  var arr = time.split(/, |\/|:/);//split on ", " or "/" or ":"
  var weekday = arr[0];
  var month = parseInt(arr[1]);
  if(boolTextMonth === true) {
  switch(month){
    case 1: 
      month = "Jan";
      break;
    case 2:
      month = "Feb";
      break;
    case 3:
      month = "Mar";
      break;
    case 4:
      month = "Apr";
      break;
    case 5:
      month = "May";
      break;
    case 6:
      month = "Jun";
      break;
    case 7:
      month = "Jul";
      break;
    case 8:
      month = "Aug";
      break;
    case 9:
      month = "Sep";
      break;
    case 10:
      month = "Oct";
      break;
    case 11:
      month = "Nov";
      break;
    case 12:
      month = "Dec";
  }
  }
  var day = arr[2];
  var year = arr[3];
  var hour = arr[4];
  var meridiem = "";
  if(boolMeridiem === true) {
    meridiem = " AM";
    let h = parseInt(hour);
    if(h > 12) {
      hour = leadingZero(h - 12);
      meridiem = " PM";
    }
    if(h === 0) {
      hour = 12;
    }
  }
  var minute = arr[5];
  var second = arr[6];
  var timeStr;
  var dateInOrder; //string with day month and year with spaces in the format order
  if(format === "DDMMYYYY") {
    dateInOrder = day + " " + month + " " + year;
  }
  if(format === "MMDDYYYY") {
    dateInOrder = month + " " + day + " " + year;
  }
  if(format === "YYYYMMDD") {
    dateInOrder = year + " " + month + " " + day;
  }
  var place = "Local";
  if(boolHideDate === true) {
    timeStr = 
        place + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  } else {
      timeStr = 
        place + "<br>" +
        weekday + "<br>" +
        dateInOrder + "<br>" +
        hour + ":" + minute + ":" + second + meridiem;
  }
  return timeStr;
}

function newClock(color, timeZone, boolTextMonth, boolHideDate, boolMeridiem, format) {
  color = color || document.getElementById("color-chosen").style.backgroundColor;
  //difference from local clock func
  timeZone = timeZone || document.getElementById("time-zone-input").value;
  boolTextMonth = boolTextMonth || document.getElementById("month-text-id").checked;
  boolHideDate = boolHideDate || document.getElementById("hide-date-id").checked;
  boolMeridiem = boolMeridiem || document.getElementById("meridiem-id").checked;
  format = format || document.getElementById("format-select").options[document.getElementById("format-select").selectedIndex].text;

  var child = document.createElement("div"); 
  child.className = "grid-item";
  child.style.backgroundColor = color;
  itemColorArr.push(color);
  var childDiv = document.createElement("div");
  childDiv.className = "clock";
  //difference from local clock func
  var dateStr = parseCurrentDateStringHtml(timeZone, boolTextMonth, boolHideDate, boolMeridiem, format);
  childDiv.innerHTML = dateStr;
  child.appendChild(childDiv);
  //difference from local clock func
  itemTimeZoneArr.push(timeZone);
  
  var childDivBtn = document.createElement("button");
  childDivBtn.className = "grid-item-btn";
  var t = document.createTextNode("X");
  childDivBtn.appendChild(t);
  child.appendChild(childDivBtn);

  var childDivColorBtn = document.createElement("button");
  childDivColorBtn.className = "grid-item-color-btn";
  childDivColorBtn.style.backgroundColor = color;
  var t = document.createTextNode("C");
  childDivColorBtn.appendChild(t);
  childDivColorBtn.style.color = color;
  childDivColorBtn.addEventListener(
      "click", function() {
        let colorGrid = document.getElementById("grid-item-color-div");
        if(colorGrid.style.display === "none") {
          colorGrid.style.display = "block";
          elementForColorChange = child;
        } else {
          if(elementForColorChange === child) {
            colorGrid.style.display = "none";
            elementForColorChange = null;
          } else {
            elementForColorChange = child;
          }
        }
      });
  child.appendChild(childDivColorBtn);


  dragFuncs(child);


  var container = document.getElementById("grid-container");
  container.appendChild(child);
  
  var gridBtn = document.getElementsByClassName("grid-item-btn");
  gridBtn[gridBtn.length-1].addEventListener(
    "click", removeClock);

  gridItemsHeightFix();
  gridTextFix();
}

function newLocalClock(color, boolTextMonth, boolHideDate, boolMeridiem, format) {
  color = color || document.getElementById("color-chosen").style.backgroundColor;
  boolTextMonth = boolTextMonth || document.getElementById("month-text-id").checked;
  boolHideDate = boolHideDate || document.getElementById("hide-date-id").checked;
  boolMeridiem = boolMeridiem || document.getElementById("meridiem-id").checked;
  format = format || document.getElementById("format-select").options[document.getElementById("format-select").selectedIndex].text;

  var child = document.createElement("div"); 
  child.className = "grid-item";
  child.style.backgroundColor = color;
  itemColorArr.push(color);
  var childDiv = document.createElement("div");
  childDiv.className = "clock";
  //difference from local clock func
  var dateStr = parseCurrentDateLocalStringHtml(boolTextMonth, boolHideDate, boolMeridiem, format);
  childDiv.innerHTML = dateStr;
  child.appendChild(childDiv);
  //difference from local clock func
  itemTimeZoneArr.push("Local");
  
  var childDivBtn = document.createElement("button");
  childDivBtn.className = "grid-item-btn";
  var t = document.createTextNode("X");
  childDivBtn.appendChild(t);
  child.appendChild(childDivBtn);

  var childDivColorBtn = document.createElement("button");
  childDivColorBtn.className = "grid-item-color-btn";
  childDivColorBtn.style.backgroundColor = color;
  var t = document.createTextNode("C");
  childDivColorBtn.appendChild(t);
  childDivColorBtn.style.color = color;
  childDivColorBtn.addEventListener(
      "click", function() {
        let colorGrid = document.getElementById("grid-item-color-div");
        if(colorGrid.style.display === "none") {
          colorGrid.style.display = "block";
          elementForColorChange = child;
        } else {
          if(elementForColorChange === child) {
            colorGrid.style.display = "none";
            elementForColorChange = -1;
          } else {
            elementForColorChange = child;
          }
        }
      });
  child.appendChild(childDivColorBtn);


  dragFuncs(child);


  var container = document.getElementById("grid-container");
  container.appendChild(child);
  
  var gridBtn = document.getElementsByClassName("grid-item-btn");
  gridBtn[gridBtn.length-1].addEventListener(
    "click", removeClock);

  gridItemsHeightFix();
  gridTextFix();
}

function dragFuncs(element) {
  element.draggable = true;
  element.addEventListener(
      "drop", function(ev) {
        ev.preventDefault();
        let el = document.getElementById("dr");
        let par = el.parentNode;
        let curEl = ev.currentTarget;

        let elIndex;
        for(elIndex = 0; elIndex < par.children.length; elIndex++) {
          if(par.childNodes[elIndex] === el) break;
        }

        let tz = itemTimeZoneArr.splice(elIndex, 1);
        let color = itemColorArr.splice(elIndex, 1);
        console.log(tz+color+elIndex);

        par.insertBefore(el, curEl);   

        for(elIndex = 0; elIndex < par.children.length; elIndex++) {
          if(par.childNodes[elIndex] === el) break;
        }
        console.log(elIndex);

        itemTimeZoneArr.splice(elIndex, 0, tz[0]);
        itemColorArr.splice(elIndex, 0, color[0]);
      }
  );
  element.addEventListener(
      "dragover", function(ev) {
        ev.preventDefault();
      }
  );
  element.addEventListener(
      "dragstart", function(ev) {
        ev.target.id = "dr";
        ev.dataTransfer.setData("text", ev.target.id);
      }
  );
  element.addEventListener(
    "dragend", function(ev) {
      let el = document.getElementById("dr");
      el.removeAttribute("id");
    }
);
}

//use the button this func is assigned to through addEventListener
function removeClock(event) {
  var gridBtn = document.getElementsByClassName("grid-item-btn");
  var removeIndex;
  //remove clock's timezone from arr
  for(removeIndex = 0; removeIndex < gridBtn.length; removeIndex++ ) {
    if(gridBtn[removeIndex] === event.target) {
      itemTimeZoneArr.splice(removeIndex, 1);
      itemColorArr.splice(removeIndex, 1);
      break;
    }
  }
  //remove clock from html and fix sizes
  event.target.parentNode.parentNode.removeChild(event.target.parentNode);
  gridItemsHeightFix();
  gridTextFix();
}

function gridItemsHeightFix() {
  //THIS FUNCTION IS HARDCODED, if you change the number of items per row change this function as well
  //change item height when a second or a third row appears
  //if width<=600 row is one element => change height at 1,2,3 element
  //if width>600 row is three elements => change height at 1,4,7 element
  //if fullscreen a column has 3 items, else it has one
  var parent = document.getElementById("grid-container");
  if(parent.children.length === 0) return;
  var bonusItemsOnColumn = (screen.width > 600) ? 2 : 0; 
  if(parent.children.length <= 1 + bonusItemsOnColumn) {
    document.documentElement.style.setProperty("--grid-items-height", "95vh");
  }
  if(parent.children.length > 1 + bonusItemsOnColumn && parent.children.length < 3 + bonusItemsOnColumn * 2) {
    document.documentElement.style.setProperty("--grid-items-height", "46vh");
  }
  //if 3 OR MORE columns
  if(parent.children.length >= 3 + bonusItemsOnColumn * 2) {
    document.documentElement.style.setProperty("--grid-items-height", "30vh");
  }
}

//fix text size inside item to "fit" inside the grid item, i.e. be as big as possible without actually getting bigger than item
function gridTextFix() {
  var parent = document.getElementById("grid-container");
  //text height and width should be smaller than grid item
  //the text should also "fit" - be as big as possible without width or height becoming bigger than item's
  if(parent.children.length === 0) return;

  var childN = parent.getElementsByClassName("grid-item")[0]; //first grid item from grid container
  var clockEl = document.getElementsByClassName("clock")[0]; //first clock object(child of grid item)

  var temp = clockEl.innerHTML;
  clockEl.innerHTML = getItemHTMLStringTemplate();

  //while grid item is smaller than text inside it reduce the text size by one pixel
  //if width or height is smaller, reduce text size(not && as one can be bigger while the other not)
  while(childN.clientHeight <= clockEl.clientHeight || childN.clientWidth <= clockEl.clientWidth) {
    document.documentElement.style.setProperty("--clock-font-size-temp",
        (parseInt(window.getComputedStyle(clockEl, null).getPropertyValue('font-size'))-1)+"px");
  }
  //while grid item is bigger than text size "fit it" - increase size as much as possible without making text bigger than item
  //&& as text width or height can become bigger while increasing and with && it will keep looping until the other is bigger too - unwanted
  //(although it shouldn't get to that poing with the condition inside the body either way)
  while(childN.clientHeight > clockEl.clientHeight && childN.clientWidth > clockEl.clientWidth) {
    document.documentElement.style.setProperty("--clock-font-size-temp",
       (parseInt(window.getComputedStyle(clockEl, null).getPropertyValue('font-size'))+1)+"px");
    //when text size becomes bigger than item, undo last increase and break out of loop
    //this check is required as text height doesn't increase/decrease by 1 px - it changes by 1 px for each line, i.e. can get as much as +/- 5 px
    if(childN.clientHeight <= clockEl.clientHeight || childN.clientWidth <= clockEl.clientWidth) {
      document.documentElement.style.setProperty("--clock-font-size-temp",
        (parseInt(window.getComputedStyle(clockEl, null).getPropertyValue('font-size'))-1)+"px");
      break; //break so no infinite loop
    }
  }
  clockEl.innerHTML = temp;
}

//using in fix time size func
//makes a template text to fix length of clocks
//template text is largest(length,width) possible with the set settings
//all chars in template are replaced with "x"
function getItemHTMLStringTemplate() {
  var templateString;
  if(document.getElementById("hide-date-id").checked) {
    //get template line with set amount of chars
    //line contains 2 line if date is hidden
    //extra char on last line, doesn't affect anything but last line not recognised if empty
    templateString = "x".repeat(longestTimeZoneLength) + "<br>" + "x";
  } else {
    //get template line with set amount of chars
    //line contains 4 lines if date is not hidden
    //extra char on last line, doesn't affect anything but last line not recognised if empty
    templateString = "x".repeat(longestTimeZoneLength) + "<br><br><br>" + "x";
  }
  return templateString;
}