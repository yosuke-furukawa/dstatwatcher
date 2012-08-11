$(document).ready(function() {
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});

	var chart;
	var target = "dsk/xvda1";
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
			renderTo: 'dskcontainer',
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
						var readY = (new Number(dstatData.dstat[target].read)).valueOf();
						var writY = (new Number(dstatData.dstat[target].writ)).valueOf();
						self.series[0].addPoint([x, readY], true, true);
						self.series[1].addPoint([x, writY], true, true);
						
					    oldDate = x;
					}
					});

					
				}
			}
		},
		title: {
			text: 'Disk IO'
		},
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150
		},
		yAxis: {
			title: {
				text: 'Disk IO'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]
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
			name: 'disk read',
			data: (function() {
				// generate an array of random data
				var data = [];
				if (history) {
					history.forEach(function(item){
							data.push({
								x: (new Date(item.time)).getTime(),
								y: (new Number(item.dstat[target].read)).valueOf()
							});
						});
				}
				return data;
			})()
		},
		{
			name: 'disk write',
			data: (function() {
				// generate an array of random data
				var data = [];
				if (history) {
					history.forEach(function(item){
							data.push({
								x: (new Date(item.time)).getTime(),
								y: (new Number(item.dstat[target].writ)).valueOf()
							});
						});
				}
				return data;
			})()
		}]
	});
});