(function () {

	/* ---------------------------------- Local Variables ---------------------------------- */
	// var service = new EmployeeService();
	// service.initialize().done(function () {
	//     console.log("Service initialized");
	// });

	var weatherView = false;
	var weekDays = Array("Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag");

	var navView = false;

	var theTimeout = 0;

	var current = "";

	var version = 0.1;

	/* --------------------------------- Event Registration -------------------------------- */
	document.addEventListener('deviceready', function()
	{
		FastClick.attach(document.body);
		init();
	}, false);
	$('document').ready(init);

	eventHandler();

	/* ---------------------------------- Local Functions ---------------------------------- */


	function init()
	{

		$.ajax({
            type: "GET",
            url: "http://nevaforget.de/wetter/version.json",
            dataType: "json"
        }).complete(function(response)
        {	
        	var response = response.responseText;
        	json = $.parseJSON(response);
        	var ver_new = Number(json.stable);

        	if(ver_new > version)
        	{
        		$('#updater').removeClass('hidden');

        		$('#exit').before('<a href="https://github.com/nevaforget/weatherapp/blob/master/Weatherapp.apk?raw=true" id="updatenow" class="btn">New version available!</a>');
        	}
        	
        });


		if (navigator.notification) { // Override default HTML alert with native dialog
				window.alert = function (message) {
						navigator.notification.alert(
								message,    // message
								null,       // callback
								"Weatherapp", // title
								'OK'        // buttonName
						);
				};
		}
		
		
 		switchView('index');

		getLocation();

		theTimeout = setTimeout(function()
		{
			switchView('search');
		}, 10000);


		document.addEventListener("menubutton", function()
		{
			if(navView)
			{
				$('.navToggler').removeClass('active');
				$('nav').addClass('hide');
				$('#page').removeClass('hide');
				navView = false;
			}
			else
			{
				$('.navToggler').addClass('active');
				$('nav').removeClass('hide');
				$('#page').addClass('hide');
				navView = true;
			}
		}, false);

		$('.rectangle').each(function(i,elm)
		{

		});
	}

	function renderView(id)
	{
		console.log('render: '+ id);

		$('.navToggler').removeClass('active');

		switch(id)
		{
			case 'index':
				$('body').addClass('loading');
				// navigator.geolocation.getCurrentPosition(function(pos){alert(pos.coords.latitude);});


				navigator.geolocation.getCurrentPosition(geo_succes, geo_error, {highAccuracy:true});

			break;
			case 'search':
				$('body').removeClass('loading');
				$('.brand').html('Suche');

				$('body').attr('data-view','search');

				$('#search').submit(function(e)
				{
					e.preventDefault();
					$('body').addClass('loading');
					routine(false,false,$('#city').val());
				});

			break;
			case 'impressum':
				$('.brand').html('Impressum');
				$('body').attr('data-view','impressum');
			break;
			case 'about':
				$('.brand').html('Über Weatherapp');
				$('body').attr('data-view','about');
			break;
		}

	}


	function eventHandler()
	{
		$('.header').click(function(e)
		{
			e.preventDefault();


			if(navView)
			{
				$('.navToggler').removeClass('active');
				$('nav').addClass('hide');
				$('#page').removeClass('hide');
				navView = false;
			}
			else
			{
				$('.navToggler').addClass('active');
				$('nav').removeClass('hide');
				$('#page').addClass('hide');
				navView = true;
			}
		});

		$('nav a:not(#exit)').click(function(e)
		{
			e.preventDefault();

			var href = $(this).attr('data-href');
			$('body').attr('data-view','');
			switchView(href);
		});

		$('#exit').click(function(e)
		{
			e.preventDefault();


			navigator.app.exitApp();
		});

		$('#page').on('click','.forecastToggler', function(e)
		{
			e.preventDefault();

			$('#content').addClass('minified');
			$('body').addClass('loading');

			console.log("render: forecast");

			forecast(current);
		});
	}

	function forecast(place)
	{

		var options =
		{
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/forecast/daily?q="+place+"&units=metric&cnt=7&lang=de",
			crossDomain: true
		}
		
		$.ajax(options).success(function(result) 
		{
			console.log(result);

			$('body').removeClass('loading');

			if(result.cod == "404") 
			{
				switchView('search');
				return false;
			}

			$('#page').remove('#fc-container');
			container = $('<div id="fc-container"></div>');
			$('#page').append(container);
			container.css({height: $(window).height() - $('.header').outerHeight() - 176});
			console.log('GEO event: forecast success');

			var i = 0;
			for(key in result.list)
			{
				elm = $('<div class="fc-elm clearfix"></div>');
				container.append(elm);

				elm.slideUp(0);

				var item = Array();
				item['desc'] = result.list[key].weather[0].description;
				item['temp0'] = parseInt(result.list[key].temp.day);
				// item['temp1'] = parseInt(result.list[key].temp.min);
				// item['temp2'] = parseInt(result.list[key].temp.max);
				item['humidity'] = parseInt(result.list[key].humidity);
				item['speed'] = parseInt(result.list[key].speed);
				item['date'] = result.list[key].dt;

				var date = new Date();
				date.setDate(date.getDate() + i+1);

				var dateMsg = date.getDate() +'.'+ (date.getMonth()+1) +'.'+ date.getFullYear();

				markup = new Object();
				markup.desc = $('<p class="desc">'+dateMsg+'</p>');
				markup.temp = $('<p class="data temperature"><span class="weather-icon '+slugify(item['desc'])+'"></span> '+item['temp0']+'°</p>');
				markup.humidity = $('<p class="data  extra humid"><span class="humidity"></span> '+item['humidity']+'%</p>');
				markup.speed = $('<p class="data extra speedo"><span class="speed"></span> '+item['speed']+'km/h</p>');

				for (info in markup)
				{
					elm.append(markup[info]);
				}
				elm.delay(500*i).slideDown(300);

				i++;
			}			
		});

	}

	function switchView(id)
	{
		$("#page").load('pages/'+id+'.html', function(response, status, xhr) 
		{
			if (status == "error") 
			{
				var msg = "Sorry but there was an error: ";
				$("#page").html( msg + xhr.status + " " + xhr.statusText );
			}
			else
			{
				renderView(id);

				$('#page').removeClass('hide');
			}
		});

		$('nav').addClass('hide');
		
	}

	var geo_succes = function(position) 
	{
		console.log('GEO event: success');
		lat = position.coords.latitude;
		var longi = position.coords.longitude;
		routine(lat, longi, false);

		clearTimeout(theTimeout);
		
		/*
	    alert('Latitude: '          + position.coords.latitude          + '\n' +
	          'Longitude: '         + position.coords.longitude         + '\n' +
	          'Altitude: '          + position.coords.altitude          + '\n' +
	          'Accuracy: '          + position.coords.accuracy          + '\n' +
	          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
	          'Heading: '           + position.coords.heading           + '\n' +
	          'Speed: '             + position.coords.speed             + '\n' +
	          'Timestamp: '         + position.timestamp                + '\n');
		*/
	};

	// geo_error Callback receives a Positigeo_error object
	//
	function geo_error(error) 
	{
		console.log('GEO event: error: '+error.code+' - '+error.message);
	    $('#content .box').html('code: '+error.code+'<br>message: '+error.message);
	}


	function slugify(str)
	{
		str = str.toString();
		str = str.trim();
		str = str.toLowerCase();
		str = str.replace(/ +/g, '-');
		str = str.replace('ä', 'ae');
		str = str.replace('ü', 'ue');
		str = str.replace('ö', 'oe');
		str = str.replace('ß', 'ss');

		return str;
	}

	function getLocation() 
	{
		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(showPosition);
		} 
		else 
		{ 
			alert("Geolocation is not supported by this browser.");
		}
	}

	function showPosition(position) 
	{
		$('body').removeClass('loading');

		$.ajax(
		{
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/weather/?units=metric&lang=de&lat="+position.coords.latitude+"&lon="+position.coords.longitude,
			crossDomain: true,
			beforeSend: function(){$('body').addClass('loading');}
		}).done(function(result)
		{
			$('#city').val(result.name);
			$('body').removeClass('loading');
			$('#lat').attr('value', '');
			$('#lon').attr('value', '');
		});
	}


	function processDate(date)
	{
		var ddate = date.split(' ');

		var dateobj = new Date(ddate[0]);
		var output = new Object();

		output.day = dateobj.getDay();
		output.weekDay = weekDays[output.day];
		output.day = dateobj.getDate();
		output.month = dateobj.getMonth()+1;

		var time = ddate[1].split(':');
		output.time = time[0];

		return output;
	}


	function routine(lat, lon, city)
	{

		$('#content').removeClass('hot');
		if (city)
		{
			var options = 
			{
				type: "GET",
				url: "http://api.openweathermap.org/data/2.5/weather?units=metric&lang=de&q="+city,
				crossDomain: true
			}
		}
		else
		{
			var options =
			{
				type: "GET",
				url: "http://api.openweathermap.org/data/2.5/weather?units=metric&lang=de&lat="+lat+"&lon="+lon,
				crossDomain: true
			}
		}
		
		$.ajax(options).done(function(result) 
		{
			console.log(result);

			$('#content').html('');
			$('body').attr('data-view','weather');
			$('body').removeClass('loading');


			if(result.cod == "404") 
			{
				switchView('search');
				return false;
			}

			if(result.name == "") result.name = result.sys.country;

			current = result.name;

			var dateobj = new Date();
			var dayinweek = dateobj.getDay();

			var item = Array();
			item['desc'] = result.weather[0].description;
			item['temp0'] = parseInt(result.main.temp);
			item['temp1'] = parseInt(result.main.temp_min);
			item['temp2'] = parseInt(result.main.temp_max);
			item['humidity'] = parseInt(result.main.humidity);
			item['speed'] = parseInt(result.wind.speed);

			if(item['temp0'] > 20) $('#content').addClass('hot');

			markup = new Object();

			$('#content').addClass(slugify(item['desc']));
			$('.brand').html(result.name);

			markup.icon = $('<div class="weather-icon '+slugify(item['desc'])+'"></div>');
			markup.desc = $('<p class="data desc center">'+item['desc']+'</p>');
			markup.temp = $('<p class="data temperature center">'+item['temp0']+'°</p>');
			markup.temp_min = $('<p class="data center temps"><span>Min: '+item['temp1']+'°</span> <span>Max: '+item['temp2']+'°</span></p>');
			markup.humidity = $('<p class="data  center extra humid"><span class="humidity"></span> <i>feuchtigkeit:</i> '+item['humidity']+'%</p>');
			markup.speed = $('<p class="data center extra speedo"><span class="speed"></span> <i>windstärke:</i> '+item['speed']+'km/h</p>');
			markup.button = $('<a class="btn ghost center forecastToggler">Wochenvorhersage</a>');

			
			for (elm in markup)
			{
				$('#content').append(markup[elm]);
			}
		});
	}
}());