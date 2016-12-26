function draw(data) {

	//Set key parameters ******************************************************************************************************************* 
		//SVG main chart
		var width = 600, //height of view port
			height = 500, //width of view port
			margin = {top: 60, right: 20, bottom: 40, left: 40, yearTitleSuffix: width/2-100};
		//SVG viewer menu
		var viewermenu_coord = {
				width: 250, height: height,
				margin: {top: 60, right: 20, bottom: 40, left: 40}
		};
		//Axis parameters
		var xAxisLabel  = "Months",
			yAxisLabel = "Average Departure Delay (in mins)";
		//Set domain values  
 			var xDomain = [1,12], //Months
				avgDelayMax = d3.max(data, function(d) { return d['MeanDepDelay']; }),
				yDomain = [0, avgDelayMax];
		//Scales
			var	x = d3.scale.linear()  //TODO show scale as Jan/Feb etc
    	        	.domain(xDomain)
        	        .range([margin.left, width-margin.right]),
            y = d3.scale.linear()
            		.domain(yDomain)
                    .range([height-margin.bottom, margin.top]); //Given SVG goes top to bottom flip the range to realign bottom to top
       	//Set chart title
		var chartTitleLabel = "Average Departure Delays at US airports",
			yearTitlePrefix = "Year on Year trends",
			yearTitleDelim = "  ";

   	//Create div structures, SVG viewports, Axis  ******************************************************************************************
	   	//http://stackoverflow.com/questions/2637696/how-to-place-div-side-by-side
   		var main_container = d3.select('#div_main')
   				.style('width', width + viewermenu_coord.width+"px") .style('height', height+"px")
   				.style('display', 'table')
   				.append('div')
   				.style('display', 'table-row')
   				.style('width', viewermenu_coord.width+"px") .style('height', height+"px");
   			svg = main_container.append('div')
   				.attr('id','div_left')
				.style('width', width+"px") .style('height',height+"px")
				.style('display','table-cell')
				.append('svg')
				.attr('id','svg_chart')
				.attr('width', width) .attr('height',height);
			div_viewermenu = main_container.append('div')
				.attr('id', 'div_right')
				.style('width',viewermenu_coord.width+"px") .style('height', viewermenu_coord.height+"px")
				.style('display','table-cell')
				.style('vertical-align','middle')
				.style('visibility','show'); //Hide it till we have completed author driven narrative
		//Helper margins - do not show once final i.e. set viewport stroke to none from grey
		function traceViewport(_svg, width, height, margin) {
			_svg.append('rect')	//Entire svg view port
				.attr('width',width) .attr('height',height) .attr('class','viewport');
			_svg.append('rect')	//lower left box
				.attr('width',margin.left) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',0) .attr('y',height-margin.bottom);
			_svg.append('rect')	//lower right  box
				.attr('width',margin.right) .attr('height',margin.bottom) .attr('class','viewport')
				.attr('x',width-margin.right) .attr('y',height-margin.bottom);
			_svg.append('rect')	//upper right  box
				.attr('width',margin.right) .attr('height',margin.top) .attr('class','viewport')
				.attr('x',width-margin.right) .attr('y',0);
			_svg.append('rect') //upper left box
				.attr('width',margin.left) .attr('height',margin.top) .attr('class','viewport')
				.attr('x',0) .attr('y',0);
		}
		traceViewport(svg, width, height, margin);
		//Highlight main chart in grey and with background image
			//http://stackoverflow.com/questions/22883994/crop-to-fit-an-svg-pattern
			//Can also style svg with background-image directly
		svg.append('image')
			.attr('x',0) .attr('y',0) .attr('width', width) .attr('height', height)
			.attr('href', 'flightdeparture.png')
			.attr('preserveAspectRatio','xMidYMid slice')
			.attr('opacity','0.2');
		svg.append('rect')
			.attr('x',0) .attr('y',0) .attr('width', width) .attr('height', height)
			.attr('fill', 'rgb(245, 241, 241)')
			.attr('opacity','0.9');			
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
		quarterSep(3); quarterSep(6); quarterSep(9); quarterSep(12);
		//Draw static parts of the title
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

	//Prepare data  ********************************************************************************************************************************
		//http://bl.ocks.org/phoebebright/raw/3176159/
		//Group by year
		var depDelayByYears = d3.nest()
			.key( function(d) {return d['Year'];} )
			.entries(data);
	
	//Prepare chart objects ************************************************************************************************************************
    	var years = [], //all years in dataset
    		baseColor = {//Color code each year by shading from a base color by decade
    			'1980' : [255,200,200, 0, 20, 20], //Red bas
    			'1990' : [200,255,200, 20, 0, 20], //Green base
    			'2000' : [200,200,255, 20, 20, 0]  //Blue base
    		};
    		yearColor = []; //mapping of color to specific year shaded //http://www.w3schools.com/colors/colors_picker.asp
		var line = d3.svg.line()
    		.x(function(d) { return x(d['Month']); })
    		.y(function(d) { return y(d['MeanDepDelay']); })
    		.interpolate('basis');
    	// For each year draw trend line and set title
    		svg.append("g").attr("class","year");
    		var _y = "1980", rgb_R = baseColor[_y][0], rgb_G = baseColor[_y][1], rgb_B = baseColor[_y][2]; 
			depDelayByYears.forEach(
				function(yearObj) {
					years.push(yearObj.key); //new year to add to data
					if (baseColor[yearObj.key]) {
						rgb_R = baseColor[yearObj.key][0], rgb_G = baseColor[yearObj.key][1], rgb_B = baseColor[yearObj.key][2];
					}
					var decade = Math.floor(yearObj.key/10)*10;
					rgb_R -= baseColor[decade][3], rgb_G -= baseColor[decade][4], rgb_B -= baseColor[decade][5]; //next shade
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
		// Show / Hide year line and text	
		function showYear(year, duration) {
			svg.selectAll('#_' + year)
				.transition()
				.duration(duration)
				.style("opacity",1);
		}
		function hideYear(year, duration) {
			d3.selectAll('#_' + year)
				.transition()
				.duration(duration)
				.style("opacity",0);
		}

	// Author driven narrative *****************************************************************************************************************
		var i=0;
		svg.selectAll('#_' + years[i])
			.style("opacity",1);
	   	var interval = setInterval(function() {
	   		i++;
	   		if (i < years.length) {
	   			hideYear(years[i-1],1000); //Hide past year 
   				showYear(years[i], 1000); //Update new year
	   		}
	   		if (i == years.length) { //last item has gone through go through so we show the last year before reseting to full picture
	   			clearInterval(interval);
	   			hideYear(years[i-1]); //Hide past year 
				switchToViewerDriven();	
	   		}
	   	},2000);
	
	// Viewer driven narrative events handling ************************************************************************************************
	   	//Create checkbox grid
	   	//Draw checkboxes for all years across by decade 1980, 1990, 2000 and hide till anmination is complete
	   	var checkboxGrid = div_viewermenu.append('table').attr('border',0).style('visibility','hidden');
		var checkboxTitleRow = checkboxGrid.append('tr'),
			checkboxYearsRow = checkboxGrid.append('tr'),
			checkboxAllRow = checkboxGrid.append('tr'),
			checkboxNoneRow = checkboxGrid.append('tr');
		//Draw checkbox title
		checkboxTitleRow.append('td').attr('colspan',3).text('Select / Deselect years:').style('font-weight','bold');
		//Draw checkboxes and label for each year
	   	function checkboxYearsSetup(decadeTable, decadeStart) {
	   		for (y=decadeStart; y < decadeStart+10; y++) {
				var checkboxY = decadeTable.append('tr')
						.attr('id','checkbox'+y)
						.style('visibility','hidden');  //Hide by default and only show later those with data
				checkboxY.append('td') //Draw checkbox
					.append('input')	
					.attr('id','cb_'+y)
					.attr('value',y)
					.attr('type','checkbox')
					.on('click', function () { //Toggle the year line checked/unchecked
						checkboxY = this;
						year = checkboxY.value;
						if (checkboxY.checked) {
							showYear(year,200);
						} else {
							hideYear(year,200);
						}
					});
				checkboxY.append('td').text(y); //Label checkbox
	   		}
	   	}
	   	//Draw each year of decades
		checkboxYearsSetup(checkboxYearsRow.append('td').append('table'), 2000);
		checkboxYearsSetup(checkboxYearsRow.append('td').append('table'), 1990);
		checkboxYearsSetup(checkboxYearsRow.append('td').append('table'), 1980);
		//Draw SelectAll
		checkboxAllRow
			.append('td')
			.attr('align','right')
			.append('input')
			.attr('id','cb_All')
			.attr('type','button')
			.on('click', function() {
				svg.selectAll(".yearLine").style("opacity",1);
				d3.selectAll('input').property('checked', true);
			});
			checkboxAllRow.append('td').text('SelectAll').style('font-weight','bold');
		//Draw .
		checkboxNoneRow
			.append('td')
			.attr('align','right')
			.append('input')								
			.attr('id','cb_None')
			.attr('type','button')
			.on('click', function() {
				svg.selectAll(".yearLine").style("opacity",0);
				d3.selectAll('input').property('checked', false);
			});
			checkboxNoneRow.append('td').text('DeselectAll').style('font-weight','bold');

		//switchToViewerDriven();	//is called post last year is drawn; uncomment for debugging to get to viewer driven directly

		//"Activate" checkboxes, show all the years to start
		function switchToViewerDriven() {
			//Show only checkboxes where data available
			svg.selectAll(".yearTitle").remove(); //The year labels are now managed via checkbox so delete
	   		svg.select('.chartTitle').select('#secondHeader')
		 		.text(yearTitlePrefix + yearTitleDelim + years[0] + " - " + years[years.length-1]);
			svg.selectAll(".yearLine")
				.transition()
				.duration(1000)
				.style("opacity",1);
			d3.selectAll('input').property('checked', true);
			years.forEach(function(_year) {
				d3.select('#checkbox'+_year).style('visibility', 'visible');				
			});
			checkboxGrid.style('visibility','visible');
	   	}
}
