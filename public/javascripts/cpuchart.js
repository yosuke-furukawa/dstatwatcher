$(document).ready(function() {
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});

	var chart;
	var target = "cpu0 usage";
	var client = tuppari.createClient({
					    applicationId: '9bc944c9-5718-4b8a-ac19-6413a178b240' // Replace this with your Application ID.
				});
	var channel = client.subscribe('dstat');
	var history = null;
	(function() {$.ajax({
					url: "/history",
					async: false,
					success: function(dstatHistory) {
						history = JSON.parse(dstatHistory);
					}
				});
    })();
	
	chart = new Highcharts.Chart({
		chart: {
			renderTo: 'cpucontainer',
			type: 'spline',
			marginRight: 10,
			events: {
				load: function() {

					// set up the updating of the chart each second
					var oldDate;
					var self = this;
					channel.bind('stat_event', function (data) {
						var dstatData = JSON.parse(data);
						var date = new Date(dstatData.time);
						if (oldDate != date.getTime()) {
						var x = date.getTime();
						var userY = (new Number(dstatData.dstat[target].usr)).valueOf();
						var sysY = (new Number(dstatData.dstat[target].sys)).valueOf();
						self.series[0].addPoint([x, userY], true, true);
						self.series[1].addPoint([x, sysY], true, true);
					    oldDate = x;
					}
					});

					
				}
			}
		},
		title: {
			text: 'Total CPU Usage'
		},
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150
		},
		yAxis: {
			title: {
				text: 'Total CPU Usage'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}],
            max: 100,
            min: 0
		},
		tooltip: {
            formatter: function() {
                return '<b>'+ this.series.name +'</b><br/>'+
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                Highcharts.numberFormat(this.y, 2);
            }
        },
		legend: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		series: [{
			name: 'User CPU',
			data: (function() {
				// generate an array of random data
				var data = [];
				if (history) {
					history.forEach(function(item){
							data.push({
								x: (new Date(item.time)).getTime(),
								y: (new Number(item.dstat[target].usr)).valueOf()
							});
						});
				}
				return data;
			})()
		},
		{
			name: 'System CPU',
			data: (function() {
				// generate an array of random data
				var data = [];
				if (history) {
					history.forEach(function(item){
							data.push({
								x: (new Date(item.time)).getTime(),
								y: (new Number(item.dstat[target].sys)).valueOf()
							});
						});
				}
				return data;
			})()
		}]
	});
});