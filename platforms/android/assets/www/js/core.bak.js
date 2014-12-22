(function () {

	var weatherView = false;
	var weekDays = Array("Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag");

	$('body').removeClass('loading');

	if(location.hash.length > 3)
	{
		var city = location.hash.replace('#', '');
		$('#city').val(city);
	}

	// THE BUTTON TO  START LOCATION DETECTION
	$('#getGeoloc').click(function(e)
	{
		e.preventDefault();
		getLocation();
		$('body').addClass('loading');
	});

	$('#weather, #forecast').click(function(e)
	{
		e.preventDefault();

		$.ajax(
		{
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/"+this.id+"/?units=metric&lang=de",
			crossDomain: true,
			data: $('#search').serialize(),
			beforeSend: function(){$('body').addClass('loading');}
		}).done(function(result) 
		{
			weatherView = true;
			$('#search').addClass('hidden');
			$('body').removeClass('loading').addClass('view-weather');

			if(typeof result.city == 'undefined')
			{
				location.hash = "#"+slugify(result.name);

				$('#weatherbox').append('<h1 class="col_12">'+result.name+'</h1>');

				var dateobj = new Date();
				var dayinweek = dateobj.getDay();

				var item = Array();
				item['desc'] = result.weather[0].description;
				item['temp0'] = parseInt(result.main.temp);
				item['temp1'] = parseInt(result.main.temp_min);
				item['temp2'] = parseInt(result.main.temp_max);
				item['humidity'] = parseInt(result.main.humidity);

				var container = $('<div class="col_12 icon day"></div>');
				container.append('<h2 class="col_12 handler date">'+weekDays[dayinweek-1]+', '+dateobj.getDate()+'.'+dateobj.getMonth()+'. <small>um '+dateobj.getHours()+' Uhr</small></h2>');	
				$('#weatherbox').append(container);			

				var wrap = $('<div class="data-wrap"></div>');
				container.append(wrap);

				wrap.append('<div class="col_2_4 weather-icon '+slugify(item['desc'])+'">'+item['desc']+'</div>');	
				wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur</dt><dd>'+item['temp0']+'°'+'</dd></dl>');
				wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur (min.)</dt><dd>'+item['temp1']+'°'+'</dd></dl>');
				wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur (max.)</dt><dd>'+item['temp2']+'°'+'</dd></dl>');
				wrap.append('<dl class="col_2_4"><dt class="feuchtigkeit">Feuchtigkeit</dt><dd>'+item['humidity']+'%'+'</dd></dl>');
			}
			else
			{
				location.hash = "#"+slugify(result.city.name);

				$('#weatherbox').append('<h1 class="col_12">'+result.city.name+'</h1>');

				for(var i = 0; i < result.list.length; i++)
				{
					var date = processDate(result.list[i].dt_txt);
					
					var item = Array();
					item['desc'] = result.list[i].weather[0].description;
					item['temp0'] = parseInt(result.list[i].main.temp);
					item['temp1'] = parseInt(result.list[i].main.temp_min);
					item['temp2'] = parseInt(result.list[i].main.temp_max);
					item['humidity'] = parseInt(result.list[i].main.humidity);

					var container = $('<div class="col_12 icon day day'+i+'"></div>');
					container.append('<h2 class="col_12 handler date">'+date.weekDay+', '+date.day+'.'+date.month+'. <small>um '+date.time+' Uhr</small></h2>');	
					$('#weatherbox').append(container);			

					var wrap = $('<div class="data-wrap"></div>');
					container.append(wrap);

					wrap.append('<div class="col_2_4 weather-icon '+slugify(item['desc'])+'">'+item['desc']+'</div>');	
					wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur</dt><dd>'+item['temp0']+'°'+'</dd></dl>');
					wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur (min.)</dt><dd>'+item['temp1']+'°'+'</dd></dl>');
					wrap.append('<dl class="col_2_4"><dt class="temp">Temperatur (max.)</dt><dd>'+item['temp2']+'°'+'</dd></dl>');
					wrap.append('<dl class="col_2_4"><dt class="feuchtigkeit">Feuchtigkeit</dt><dd>'+item['humidity']+'%'+'</dd></dl>');
				}
			}
		});
	});


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

	window.onhashchange = function()
	{
		if(location.hash == "")
		{
			weatherView = false;
			$('#weatherbox').empty();
			$('#search').removeClass('hidden');
			$('body').removeClass('view-weather');
		}
		else if (location.hash != "" && !weatherView)
		{
			var qry = window.location.replace('#', '');
			$('#city').attr('value', qry);
			$('#search').submit();
		}
	};

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


}());