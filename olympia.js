/* global Module */
/* Magic Mirror
 * Module: olympia
 *
 * By Lasse Wollatz https://github.com/XXXXX
 * MIT Licensed.
 */
Module.register('olympia', {
  defaults: {
    maximumEntries: 8,
    sorting: 'traditional',
    interest: ['Brazil'],
    showColor: true,
    showMedals: true,
    showFlags: false,
    showCountry: true,
    fade: true,
    fadePoint: 0.1,
    animationSpeed: 3,
    updateInterval: 15,
    language: config.language,
    units: config.units,
    timeFormat: config.timeFormat,
    apiBase: 'http://www.medalbot.com/',
    apiEndpoint: 'api/v1/medals',
    debug: false
  },
  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.url = this.config.apiBase + this.config.apiEndpoint;
    this.update();
    setInterval(
        this.update.bind(this),
        this.config.updateInterval * 60 * 1000);
  },
  update: function() {
        this.sendSocketNotification(
            'OLYMPIA_REQUEST', {
                id: this.identifier,
                url: this.config.apiBase + this.config.apiEndpoint
            }
        );
        if (this.config.debug){
          this.sendNotification("SHOW_ALERT", { timer: 3000, title: "Medals", message: "update"});
        }
  },
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'OLYMPIA_RESPONSE' && payload.id === this.identifier) {
        Log.info('received' + notification);
        if(payload.data){ //&& payload.data.status === "OK"
            this.data = payload.data;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed * 1000);
        }/*else{
            this.sendNotification("SHOW_ALERT", { timer: 3000, title: "Medals", message: payload.data[0]});
        }*/
    }
  },
  getStyles: function() {
    return ["olympia.css","flags.css"];
  },
  getScripts: function() {
        return ["moment.js"];
  },
  getTranslations: function() {
    return {
        en: "translations/en.json"
    };
  },
  getDom: function() {
    /* main function creating HTML code to display*/
    var wrapper = document.createElement("div");
    if (!this.loaded) {
        /*if not loaded, display message*/
        wrapper.innerHTML = this.translate("LOADING_CONNECTIONS");
        wrapper.className = "small dimmed";
    }else{
        var table = document.createElement("table");
        var Nrs = 0; //number of countries
        var Ninterest = this.config.interest.length; //number of countries of interest
        var countryArray = []; //array of all alternatives for later sorting
        
        var th = document.createElement("tr");
        th.className = "small bright";
        
        var thPlace = document.createElement("td");
        thPlace.className = "small";
        thPlace.innerHTML = " "; //Pos
        th.appendChild(thPlace);
            
        var thName = document.createElement("td");
        thName.className = "small label";
        thName.innerHTML = " "; //country
        th.appendChild(thName);
        
        var thGold = document.createElement("td");
        var thSilver = document.createElement("td");
        var thBronze = document.createElement("td");
        if(this.config.showMedals){    
            var imgG = document.createElement("img");
            var imgS = document.createElement("img");
            var imgB = document.createElement("img");
            imgG.className = "medal";
            imgS.className = "medal";
            imgB.className = "medal";
            //imgG.src = "/olympia/bw-gold.png";
            //imgS.src = "/olympia/bw-silver.png";
            //imgB.src = "/olympia/bw-bronze.png";
            if(this.config.showColor){
                imgG.src = "/olympia/gold.png";
                imgS.src = "/olympia/silver.png";
                imgB.src = "/olympia/bronze.png";
            }else{
                imgG.src = "/olympia/bw-gold.png";
                imgS.src = "/olympia/bw-silver.png";
                imgB.src = "/olympia/bw-bronze.png";
            }
            thGold.appendChild(imgG);
            thSilver.appendChild(imgS);
            thBronze.appendChild(imgB);
        }else{
            thGold.className = "small";
            thGold.innerHTML = "&nbsp;G";
            thSilver.className = "small";
            thSilver.innerHTML = "&nbsp;S";
            thBronze.className = "small";
            thBronze.innerHTML = "&nbsp;B";
        }
        th.appendChild(thGold);
        th.appendChild(thSilver);
        th.appendChild(thBronze);
        
        table.appendChild(th);
        
        for(var cntryKey in this.data) {
            /*each route describes a way to get from A to Z*/
            var country = this.data[cntryKey];
            if(Nrs < this.config.maximumEntries - Ninterest || this.config.interest.indexOf(country.country_name) > -1){
              
            
            var tr = document.createElement("tr");
            tr.className = "small";
            
            var Place = document.createElement("td");
            Place.className = "small";
            Place.innerHTML = country.place + "&nbsp;";
            tr.appendChild(Place);
            
            var CountryName = document.createElement("td");
            CountryName.className = "small bright label";
            if(this.config.showFlags){
                var imgC = document.createElement("img");
                if(this.config.showColor){
                    imgC.className = "flag flag-"+country.id;
                }else{
                    imgC.className = "bw-flag flag-"+country.id;
                }
                imgC.src = "/olympia/blank.gif";
                imgC.alt = country.country_name;
                CountryName.appendChild(imgC);
            }
            if(this.config.showCountry){
                var lblC = document.createElement("text");
                //var transcode = country.country_name.ToUpperCase();
                //transcode = transcode.replace(" ","_");
                lblC.innerHTML = "&nbsp;" + country.country_name; //this.translate(transcode);
                CountryName.appendChild(lblC);
            }
            tr.appendChild(CountryName);
            
            var Gold = document.createElement("td");
            Gold.className = "small";
            Gold.innerHTML = country.gold_count;
            tr.appendChild(Gold);
            
            var Silver = document.createElement("td");
            Silver.className = "small";
            Silver.innerHTML = country.silver_count;
            tr.appendChild(Silver);
            
            var Bronze = document.createElement("td");
            Bronze.className = "small";
            Bronze.innerHTML = country.bronze_count;
            tr.appendChild(Bronze);
            
            countryArray.push({"medals":country.total_count,"gold":country.gold_count,"silver":country.silver_count,"bronze":country.bronze_count,"html":tr});
            Nrs += 1;
            if (this.config.interest.indexOf(country.country_name) > -1){
                Ninterest -= 1;
            }
            
            }
        }
        
        /*sort the different alternative routes by arrival time*/
        if(this.config.sorting == "total"){
            countryArray.sort(function(a, b) {
                return parseFloat(b.medals) - parseFloat(a.medals);
            });
        }else{
            countryArray.sort(function(a, b) {
                return parseFloat(b.bronze) - parseFloat(a.bronze);
            });
            countryArray.sort(function(a, b) {
                return parseFloat(b.silver) - parseFloat(a.silver);
            });
            countryArray.sort(function(a, b) {
                return parseFloat(b.gold) - parseFloat(a.gold);
            });
        }
        /*only show the first few options as specified by "maximumEntries"*/
        countryArray.slice(0, this.config.maximumEntries);
        
        /*create fade effect and append list items to the list*/
        var e = 0;
        Nrs = countryArray.length;
        for(var dataKey in countryArray) {
            var countryData = countryArray[dataKey];
            var countryHtml = countryData.html;
            // Create fade effect. 
            if (this.config.fade && this.config.fadePoint < 1) { 
                if (this.config.fadePoint < 0) { 
                    this.config.fadePoint = 0; 
                } 
                var startingPoint = Nrs * this.config.fadePoint; 
                var steps = Nrs - startingPoint; 
                if (e >= startingPoint) { 
                    var currentStep = e - startingPoint; 
                    countryHtml.style.opacity = 1 - (1 / steps * currentStep);
                }
            }
            table.appendChild(countryHtml);
            e += 1;
        }
        wrapper.appendChild(table);
    }
    return wrapper;
  },
  shorten: function(string, maxLength) { 
    /*shorten
     *shortens a string to the number of characters specified*/
    if (string.length > maxLength) { 
        return string.slice(0,maxLength) + "&hellip;"; 
    }
    return string; 
  }

});

