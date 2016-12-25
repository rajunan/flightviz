function draw(data) {

	//SVG viewport
		//Viewport height, width and margins, 
		var width = 600, //height of view port
			height = 500, //width of view port
			margin = {top: 60, right: 20, bottom: 40, left: 40, yearTitleSuffix: 90};

		var xAxisLabel  = "Months",
			yAxisLabel = "Average Departure Delay (in mins)";
		//Set domain values  
 			var xDomain = [1,12], //Months
				avgDelayMax = d3.max(data, function(d) {
										return d['MeanDepDelay'];
									}),
				yDomain = [0, avgDelayMax];

			//Scales
				var	x = d3.scale.linear()  //TODO show scale as Jan/Feb etc
    	        		.domain(xDomain)
        	            .range([margin.left, width-margin.right]),
            	y = d3.scale.linear()
            			.domain(yDomain)
                    	.range([height-margin.bottom, margin.top]); //Given SVG goes top to bottom flip the range to realign bottom to top

   //Create the SVG Viewport
		var svg = d3.selectAll('#flightviz') //refers to the div block specified
				.append('svg')
				.attr('width', width) .attr('height',height);

		//Helper margins - remove once done with final graph in (set viewport stroke to none from grey) 
		svg.append('rect')	//Entire svg view port
				.attr('width',width) .attr('height',height) .attr('class','viewport');
		svg.append('rect')	//lower left box
				.attr('width',margin.left) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',0) .attr('y',height-margin.bottom);
		svg.append('rect')	//lower right  box
				.attr('width',margin.right) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',width-margin.right) .attr('y',height-margin.bottom);
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
				.attr('x',width/2) .attr('y',height-margin.bottom/4)
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
				.attr("transform","rotate(-90)") //rotates view counter clockwise 90degrees
				.attr('x',-(height-margin.bottom-1/2*(height-(margin.bottom+margin.top)))) .attr('y',margin.left/3)
				.text(yAxisLabel);

	//Draw Quarter separators
		function quarterSep(quarter) {
			svg.append("line")
				.attr("class","quarterSep")
				.attr('x1',x(quarter)).attr('y1',y(0))
				.attr('x2',x(quarter)).attr('y2',y(avgDelayMax));
		}
		quarterSep(3);
		quarterSep(6);
		quarterSep(9);

	debugger;

	//Set chart title
		var chartTitleLabel = "Average Departure Delays at US airports",
			yearTitlePrefix = "Year on Year trends",
			yearTitleDelim = " : ";
		//Draw the static parts of the title
		svg.append("g")
			.attr("class","chartTitle")
			.append("text")
			.attr("id","mainHeader")
			.attr('x',width/2) .attr('y',margin.top/3) //place third from top margin
			.text(chartTitleLabel);
		d3.select(".chartTitle")
			.append("text")
			.attr("id","secondHeader")
			.attr('x',width/2) .attr('y',margin.top/4*3) //place two thirds from top margin
			.text(yearTitlePrefix);


	//Data prep - Group by year
		//http://bl.ocks.org/phoebebright/raw/3176159/
		var depDelayByYears = d3.nest()
			.key( function(d) {return d['Year'];} )
			.entries(data);
	//Visualization
    	var year = [], //all years in dataset
    		yearColor = []; //mapping of color to specific year
    	var rgb_R = 200, rgb_G = 200, rgb_B = 255; //base shade color - Shading valuey http://www.w3schools.com/colors/colors_picker.asp

		var line = d3.svg.line()
    		.x(function(d) { return x(d['Month']); })
    		.y(function(d) { return y(d['MeanDepDelay']); })
    		.interpolate('basis');

    	// Step 1 - Chart setup
    		svg.append("g").attr("class","year"); //
    		//
			depDelayByYears.forEach(
				function(yearObj) {
					//.append("path") is used because we really only have one data object (a set of x,y coordinates)
					//so we do not need to selectAll(), .enter(), append() like we have with other data sets.
					year.push(yearObj.key);
					rgb_R -=20, rgb_G -=20; //next shade of blue
					yearColor[yearObj.key] = "rgb("+rgb_R+","+rgb_G+","+rgb_B+")";
					svg.select(".year").append("g")
						.attr("class","yearLine")
						.attr('id', "_" + yearObj.key)	 //ID cannot start as numbers
						.style("stroke", yearColor[yearObj.key])
						.append('path')
						.attr("d", line(yearObj.values));
					svg.select(".year").append("g")
						.attr("class","yearTitle")
						.attr('id', "_" + yearObj.key)	 //ID cannot start as numbers
						.append("text")
						.attr('x',width/2 + margin.yearTitleSuffix) .attr('y',margin.top/4*3) //place two thirds from top margin and to the right of prefix
						.text(yearTitleDelim + yearObj.key);
      			}
    		);

		// Step 2 - Show / Hide year line and text	
		function updateYear(year) {
			svg.selectAll('#_' + year)
				.transition()
				.duration(2000)
				.style("opacity",1);
		}
		function hideYear(year) {
			d3.selectAll('#_' + year)
				.transition()
				.duration(3000)
				.style("opacity",0);
		}		

		debugger;
		var i=0;
		svg.selectAll('#_' + year[i])
			.style("opacity",1);
	   	var interval = setInterval(
	   		function() {
	   			i++;
	   			if (i < year.length) {
		   			hideYear(year[i-1]); //Hide past year 
	   				updateYear(year[i]); //Update new year
	   			}
	   			if (i == year.length) { //last item has gone through go through so we show the last year before reseting to full picture
	   				clearInterval(interval);
		   			hideYear(year[i-1]); //Hide past year 
		 			svg.select('.chartTitle').select('#secondHeader')
		 				.text(yearTitlePrefix + yearTitleDelim + year[0] + " - " + year[year.length-1]);
					svg.selectAll(".yearLine")
						.style("opacity",1);
	   			}
	   		}, 
	   	4000);
}
