function draw(data) {
	//Configure view port
		//Viewport height, width and margins
		var width = 600, //height of view port
			height = 500, //width of view port
			margin = {top: 20, right: 20, bottom: 40, left: 40};

		var xAxisLabel  = "Months",
			yAxisLabel = "Average Departure Delay (in mins)",
			chartTitle = "Year on Year Trends - US airport Average Departure Delays"
			//Domain specification 
 				var xDomain = [1,12]; //Months
				var	yMax = d3.max(data, function(d) {
											return d['MeanDepDelay'];
										});
					yDomain = [0, yMax];

			//Scale
			var	x = d3.scale.linear()
            		.domain(xDomain)
                    .range([margin.left, width-margin.right]),
            y = d3.scale.linear()
            		.domain(yDomain)
                    .range([height-margin.bottom, margin.top]); //Given SVG goes top to bottom flip the range to realign bottom to top

    //Create the SVG Viewport
		var svg = d3.selectAll('#flightviz') //refers to the div block if on specified will create new one and add to the end of HTML
				.append('svg')
				.attr('width', width) .attr('height',height);
		//Illustrate the margins - remove once done with final graph in (set viewport stroke to none from grey) 
		svg.append('rect')	//Entire svg view port
				.attr('width',width) .attr('height',height) .attr('class','viewport');
		svg.append('rect')	//lower left box
				.attr('width',margin.left) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',0) .attr('y',height-margin.bottom);
		svg.append('rect')	//lower right  box
				.attr('width',margin.right) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',width-margin.right) .attr('y',y(1));
		svg.append('rect')	//upper right  box
				.attr('width',margin.right) .attr('height',margin.top) .attr('class','viewport')
				.attr('x',width-margin.right) .attr('y',0);
		svg.append('rect') //upper left box
				.attr('width',margin.left) .attr('height',margin.top) .attr('class','viewport')
				.attr('x',0) .attr('y',0);

	//xAxis define, draw and axis text
        var	xAxis = d3.svg.axis() 
                	.scale(x)
                	.orient("bottom"); //where to place the tick label, bottom=below axis line, top=above axis line
			svg.append("g")
				.attr('class','axis')
				.attr("transform", "translate("+0+ "," + (height - margin.bottom) + ")") //translate (x-zero,y-zero)
				.call(xAxis);
			svg.append("g")	
				.attr('class','axis') //bit of complicated way to reuse the axis text
				.append("text") 
				.attr('x',width/2) .attr('y',height-margin.bottom/6)
				.text(xAxisLabel);
	//yAxis define, draw and axis text
        var	yAxis = d3.svg.axis()
                	.scale(y)
                	.orient("left");
			svg.append("g")
				.attr('class','axis')
				.attr("transform", "translate("+margin.left+"," + 0 + ")") //translate (x-zero,y-zero)
				.call(yAxis);
			svg.append("g")	
				.attr('class','axis') //bit of complicated way to reuse the axis text
				.append("text")
				.attr("transform","rotate(-90)") //rotates coord system counter clockwise 90degrees
				.attr('x',-(height-margin.bottom-1/2*(height-(margin.bottom+margin.top)))) .attr('y',margin.left/3)
				.text(yAxisLabel);

	//ChartTitle
	function updateChartTitle(text) {
		d3.select("h3")
			.text(text);
	}
	updateChartTitle(chartTitle);

	//Group by year
	//http://bl.ocks.org/phoebebright/raw/3176159/
		var depDelayByYears = d3.nest()
			.key( function(d) {return d['Year'];} )
			.entries(data);

	//Draw all the years first
    	var year = [], //hash map of year available year keys
    		yearColor = []; //mapping of color to specific year
    	var rgb_R = 200, rgb_G = 200, rgb_B = 255; //base shade color - Shading valuey http://www.w3schools.com/colors/colors_picker.asp

		var line = d3.svg.line()
    		.x(function(d) { return x(d['Month']); })
    		.y(function(d) { return y(d['MeanDepDelay']); })
    		.interpolate('basis');

		depDelayByYears.forEach(
			function(yearObj) {
				year.push(yearObj.key); //add to years dataset
				rgb_R -=20, rgb_G -=20; //next shade of blue
				yearColor[yearObj.key] = "rgb("+rgb_R+","+rgb_G+","+rgb_B+")";	//assign next shade of blue to the year
				svg.append('path')
					.attr("class", "yearline")
					.attr('id', "_" + yearObj.key)	 //ID cannot start as numbers
      	  			.attr("d", line(yearObj.values));
      		}
    	);

	// Chart 2 - Animate through the years
		function updateYear(year) {
			svg.select('#_' + year)
				.transition()
				.duration(2000)
				.style("stroke", yearColor[year]);
		}
		function hideYear(year) {
			d3.select('#_' + year)
				.transition()
				.duration(100)
				.style("stroke", "none");
		}	

		var i = 0;
	   	updateYear(year[0]); //Start with year 0
	   	updateChartTitle(chartTitle + " : " + year[0]);
	   	var interval = setInterval(
	   		function() {
	   			i++;
	   			if (i < year.length) {
		   			hideYear(year[i-1]); //Hide past year 
	   				updateYear(year[i]); //Update new year
				   	updateChartTitle(chartTitle + " : " + year[i]);
	   			}
	   			if (i == year.length) { //Show all the years
	   				clearInterval(interval);
	   				debugger;
					for (i=0;i<year.length;i++) {
						svg.select("#_" + year[i])
							.style("stroke", yearColor[year[i]]);
					}
					updateChartTitle(chartTitle + " : " + year[0] + " - " + year[year.length-1]);
	   			}
	   		}, 
	   	4000);

	   	//TODO: enabel reader driven selection of years to reviews

}