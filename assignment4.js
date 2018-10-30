// Javascript file for Assignment 4
// Author: Eva Grench
// Date: 10/31/18


w = 1200;			// Width of visualization
h = 700;			// Height of visualization
margin = 10;        // Margin around visualization
xOffset = 40;       // Space for x-axis labels
transDur = 1500;	// Duration of transitions (in milliseconds)
vals = ['State','Area name','Education level','1970','1980','1990','2000','2016'] // data columns
yearToX = {1970: 200, 1980: 400, 1990: 600, 2000: 800, 2016: 900}
colors = ['Red','Blue','Yellow']

// create svg element at assignment4 id
var svg = d3.select('#assignment4')
  .append('svg:svg')
  .attr('width', w)
  .attr('height', h + 12);

yScale = d3.scale.linear()
            .domain([0,100])
            .range([h - margin, margin]);

// create vertical bars along x-axis at barPosition
function makeBars(data, year) {

    //TODO: Clean data so it works for this case
    var bar = svg.selectAll('.bar')
               .data(data);
               
    bar.enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', function(d) {
              console.info('year', year)
              return yearToX[year]
          })
         .attr('y', function(d) {
              return yScale(d[year])
          })
         .attr('width', 20)
         .attr('height', function(d) {
              return yScale(d[year])
          });
}
    
function makeAxis(data, barPosition, year) {
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

// creates lines in between vertical bars
function drawLines(data) {
    tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    line = svg.selectAll('.polyline')
                .data(data);

    //attaches line data to each line
    line.enter().append('polyline')
                .attr('class', 'line')
                .attr('points', function(d) { return getPolylinePoints(d); })
                .style('stroke', function(d) { return getStroke(d); })
                .style('stroke-width', function(d) { return getStrokeWidth(d); })
                .style('fill','none')
                .on('mouseover', function(d) {
                    showTooltip(d);
                    if (d['State'] != 'US') {
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

function hideTooltip() {
    tooltip.transition()
            .duration(400)
            .style('opacity', 0);
}

function showTooltip(d) {
    tooltip.transition()
            .duration(200)
            .style('opacity', .9);
    tooltip.html('<p>' + d['Area name'] + '</p>')
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
}

function getStroke(d) {
    if (d['State'] == 'US') {
        return 'SteelBlue';
    } else if (d['Education level'] == 'Less than high school') {
        return '#D1D1D1';
    } else if (d['Education level'] == 'High school') {
        return '#AFACAC';
    } else if (d['Education level'] == 'College or more') {
        return '#787878';
    }
}

function getStrokeWidth(d) {
    if (d['State'] == 'US') {
        return '5px';
    } else {
        return '1px';
    }
}

function getPolylinePoints(d) {
    var points ='';
    for (var i = 3; i < vals.length; i++) {
        percent = Number(d[vals[i]])
        if (d['Education level'] == 'Less than high school') {
            points += (i - 2) * 200 + ',' + yScale(percent) + ', ';
        } else if (d['Education level'] == 'High school') {
            prevVal = findPreviousValue(i, d);
            points += (i - 2) * 200 + ',' + yScale(prevVal + percent) + ', ';
        } else if (d['Education level'] == 'College or more') {
            points += (i - 2) * 200 + ',' + yScale(100 - percent) + ', ';
        }
    }
    return points.slice(0, -2);
}

function findPreviousValue(i, d) {
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

// changes visual data of line when clicked
function toggleLine(selectedLineData, clickedOn, newThickness) {
    lines = d3.selectAll('polyline')
    for (i = 0; i < lines.length; i++) {
        for (j = 0; j < lines[i].length; j++) {
            if (lines[i][j].__data__['State'] == selectedLineData['State']) {
                if (clickedOn) {
                    lines[i][j].style.stroke = 'Crimson'
                } else {
                    lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
                }
                lines[i][j].style.strokeWidth = newThickness
            }
        }
    }
}

// changes visual data of line when hovered over and moused out
function highlightLine(selectedLineData, isMouseOver) {
  lines = d3.selectAll('polyline')
	for (i = 0; i < lines.length; i++) {
		for (j = 0; j < lines[i].length; j++) {
			if (lines[i][j].__data__['State'] == selectedLineData['State'] && lines[i][j].style.strokeWidth != '5px' && !isMouseOver) {
				lines[i][j].style.stroke = getStroke(lines[i][j].__data__)
			} else if (lines[i][j].__data__['State'] == selectedLineData['State'] && lines[i][j].style.strokeWidth != '5px' && isMouseOver) {
				lines[i][j].style.stroke = 'Crimson'
			}
		}
	}
}

// loads csv data and calls create bars and create line functions
d3.csv('EducationFinal.csv', function(csvData) {
    var data = csvData;
    drawLines(data);
    
    var year = 1970
    for (var i = 0; i < 5; i++) {
        makeAxis(data, (i+1)*200, year);
        year += 10
    }
    
    var usData = [];
    usData.push(data[200], data[201], data[202], data[203]);
    for (var i = 3; i < vals.length; i++) {
        makeBars(usData, vals[i])
    }
});

