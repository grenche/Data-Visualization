// Javascript file for Assignment 4
// Author: Eva Grench
// Date: 10/31/18

width = 1270;
height = 730;
w = 1200;			// Width of visualization
h = 700;			// Height of visualization
margin = 10;        // Margin around visualization
xOffset = 40;       // Space for x-axis labels
transDur = 1500;	// Duration of transitions (in milliseconds)
vals = ['State','Area name','Education level','1970','1980','1990','2000','2016'] // data columns for the line data
yearToX = {1970: 200, 1980: 400, 1990: 600, 2000: 800, 2016: 1000} // mapping of years to x positions
eduToColor = {'Less than high school': '#ccaa45', 'High school': '#86b265', 'Some college': '#7a91c1', 'College or more': '#b2746b'} // for the bars
divisionToColor = {'Less than high school': '#a9ae55', 'High school': '#80a293', 'College or more': '#998192'} // for the lines
mouseOverColor = '#565556'

yScale = d3.scale.linear()
            .domain([0,100])
            .range([h - margin, margin]);

// create svg element at assignment4 id
var svg = d3.select('#assignment4')
  .append('svg:svg')
  .attr('width', width)
  .attr('height', height + 12);

// adds labels to the svg element
function addAxisLabels() {
    // add an x-axis label
    svg.append("text")             
        .attr("transform", "translate(" + (w/2) + " ," + (h + margin + 25) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Year");

    // add a y-axis label
    svg.append("text")
        .attr("transform", "translate(" + 165 + " ," + (h/2) + ") rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Percent of population");
}

// draws the bars for the US average
function drawBars(data) {
    var bar = svg.selectAll('.bar')
               .data(data);

   bar.enter()
     .append('rect')
     .attr('class', 'bar')
     .attr('x', function(d) { return yearToX[d['Year']] })
     .attr('y', function(d) { return yScale(findPreviousValueBar(d) + Number(d['Percent'])); }) // y position is current percent plus whatever it should be on top of
     .attr('width', 20)
     .attr('height', function(d) { return d['Percent'] * 6.8 }) // I have no idea why 6.8 works, but nothing else I tried did so...
     .attr('fill', function(d) { return eduToColor[d['Education level']] })
     .attr('stroke', 'black');
}

// draws the axis for each year
function drawAxis(data, barPosition, year) {
    yAxis = d3.svg.axis()
    			.scale(yScale)
    			.orient('left')
    			.ticks(4)

    yAxisG = svg.append('g')
    			.attr('class', 'axis')
    			.attr('transform', 'translate(' + barPosition + ',0)')
                .style({'stroke-width': '2px'})
    			.call(yAxis);

    yLabel = svg.append('text')
    			.attr('class','label')
    			.attr('x', barPosition)
    			.attr('y', h + 10)
    			.text(year);
}

// draws all the lines
function drawLines(data) {
    // displays the state when a line is hovered over
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    line = svg.selectAll('.polyline')
                .data(data);

    line.enter().append('polyline')
                .attr('class', 'line')
                .attr('points', function(d) { return getPolylinePoints(d); })
                .style('stroke', function(d) { return getStroke(d); })
                .style('stroke-width', function(d) { return getStrokeWidth(d); })
                .style('fill','none')
                .on('mouseover', function(d) {
                    showTooltip(d);
                    if (d['State'] != 'US') { // never change the color or width of US average
                        highlightLine(d, true);
                    }
                })
                .on('mouseout', function(d) {
                    hideTooltip();
                    if (d['State'] != 'US') {
                        highlightLine(d, false);
                    }
                })
                .on('click', function(d) {
                    if (d3.select(this).style('stroke-width') == '1px') { // Clicked on
                        toggleLine(d, true, '5px');
                    } else if (d['State'] != 'US') { // Clicked off (can't click on US)
                        toggleLine(d, false, '1px');
                    }
                });
}

// hides the tooptip on mouseout
function hideTooltip() {
    tooltip.transition()
            .duration(400)
            .style('opacity', 0);
}

// shows the tooltip on mousein
function showTooltip(d) {
    tooltip.transition()
            .duration(200)
            .style('opacity', .9); // makes it visible
    tooltip.html('<p>' + d['Area name'] + '</p>') // shows the state
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
}

// gets the color for a given line
function getStroke(d) {
    if (d['State'] == 'US') {
        return 'Black';
    } else {
        return divisionToColor[d['Education level']]
    }
}

// gets the stoke width to be 1px unless looking at US
function getStrokeWidth(d) {
    if (d['State'] == 'US') {
        return '5px';
    } else {
        return '1px';
    }
}

// gets the point string for where the polyline should be drawn
function getPolylinePoints(d) {
    var points ='';
    for (var i = 3; i < vals.length; i++) {
        percent = Number(d[vals[i]])
        if (d['Education level'] == 'Less than high school') {
            points += (i - 2) * 200 + ',' + yScale(percent) + ', '; // height is just the percent for the first one
        } else if (d['Education level'] == 'High school') {
            prevVal = findPreviousValueLine(i, d);
            points += (i - 2) * 200 + ',' + yScale(prevVal + percent) + ', '; // the previous percent plus the current one
        } else if (d['Education level'] == 'College or more') {
            points += (i - 2) * 200 + ',' + yScale(100 - percent) + ', '; // the third division is just 100 - the percent in the fourth group
        }
    }
    return points.slice(0, -2);
}

// finds the height of the previous education level for lines
function findPreviousValueLine(i, d) {
    lines = d3.selectAll('polyline');
    prevVal = 0;
    for (var k = 0; k < lines.length; k++) {
        for (var l = 0; l < lines[k].length; l++) {
            if (lines[k][l].__data__['State'] == d['State'] && lines[k][l].__data__['Education level'] == 'Less than high school') {
                return prevVal = Number(lines[k][l].__data__[vals[i]]);
            }
        }
    }
}

// finds the height of the previous education level for bars
function findPreviousValueBar(d) {
    var bars = d3.selectAll('.bar');
    var prevVal = 0;
    for (var k = 0; k < bars.length; k++) {
        for (var l = 0; l < bars[k].length; l++) {
            var curVal = Number(bars[k][l].__data__['Percent']);
            var curEdu = bars[k][l].__data__['Education level'];
            var curYear = bars[k][l].__data__['Year'];
            
            if (d['Education level'] == 'High school') {
                if (curYear == d['Year'] && curEdu == 'Less than high school') {
                    prevVal += curVal;
                }
            } else if (d['Education level'] == 'Some college') {
                if (curYear == d['Year'] && (curEdu == 'Less than high school' || curEdu == 'High school')) {
                    prevVal += curVal;
                }
            } else if (d['Education level'] == 'College or more') {
                if (curYear == d['Year'] && (curEdu == 'Less than high school' || curEdu == 'High school' || curEdu == 'Some college')) {
                    prevVal += curVal;
                }
            }
        }
    }
    return prevVal;
}

// changes the thickness and color of a line when clicked
function toggleLine(selectedLineData, clickedOn, newThickness) {
    lines = d3.selectAll('polyline')
    for (i = 0; i < lines.length; i++) {
        for (j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__['State'] == selectedLineData['State']) {
                if (clickedOn) {
                    lines[i][j].style.stroke = mouseOverColor
                } else {
                    lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
                }
                lines[i][j].style.strokeWidth = newThickness
            }
        }
    }
}

// changes the color of a line when hovered over and moused out
function highlightLine(selectedLineData, isMouseOver) {
  lines = d3.selectAll('polyline')
	for (i = 0; i < lines.length; i++) {
		for (j = 0; j < lines[i].length; j++) {
			if (lines[i][j].__data__['State'] == selectedLineData['State'] && lines[i][j].style.strokeWidth != '5px' && !isMouseOver) {
				lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
			} else if (lines[i][j].__data__['State'] == selectedLineData['State'] && lines[i][j].style.strokeWidth != '5px' && isMouseOver) {
				lines[i][j].style.stroke = mouseOverColor
			}
		}
	}
}

// loads csv data and calls create axes and create line functions
d3.csv('EducationFinal.csv', function(csvData) {
    var data = csvData;
    drawLines(data);

    var year = 1970
    for (var i = 0; i < 5; i++) {
        if (year == 2010) {
            year = 2016;
        }
        drawAxis(data, (i+1)*200, year);
        year += 10
    }
    addAxisLabels()
});

// loads the US only csv data and draws the bars
d3.csv('US.csv', function(csvData) {
    var usData = csvData;
    drawBars(usData)
});
