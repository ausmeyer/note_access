var svg1 = d3.select("#svg1"),
	margin1 = {top: 20, right: 250, bottom: 20, left: 200},
	width1 = +svg1.attr("width") - margin1.left - margin1.right,
	height1 = +svg1.attr("height") - margin1.top - margin1.bottom,
	g1 = svg1.append("g").attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

var x_1 = d3.scaleLinear()
	.rangeRound([0, width1]);

// The scale spacing the groups:
var y0_1 = d3.scaleBand()
	.rangeRound([height1, 0])
	.paddingInner(0.1);

// The scale for spacing each group's bar:
var y1_1 = d3.scaleBand()
	.padding(0.05);

var z_1 = d3.scaleOrdinal()
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("access_summary_normalized.csv", function(d, i, columns) {
	for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
	return d;
}).then(function(data) {
	console.log(data);

	var keys = data.columns.slice(1);

  data.sort(function(a, b) { return a.Total - b.Total; });

  x_1.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
	y0_1.domain(data.map(function(d) { return d.access_prov_type; }));
	y1_1.domain(keys).rangeRound([0, y0_1.bandwidth()]);

	g1.append("g")
		.selectAll("g")
		.data(data)
		.enter().append("g")
			.attr("class","bar")
			.attr("transform", function(d) { return "translate(0," + y0_1(d.access_prov_type) + ")"; })
		.selectAll("rect")
		.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append("rect")
			.attr("y", function(d) { return y1_1(d.key); })
			.attr("x", 0)
			.attr("height", y1_1.bandwidth())
			.attr("width", function(d) { return x_1(d.value); })
			.attr("fill", function(d) { return z_1(d.key); });

	g1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height1 + ")")
		.call(d3.axisBottom(x_1).ticks(10))
		.append("text")
			.attr("x", 2)
			.attr("y", margin1.left * 0.8 * -1)
			.attr("dy", "0.32em")
			.attr("fill", "#000")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start");

	g1.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(y0_1))
		.selectAll("text")
			.style("text-anchor", "end");

	var legend = g1.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 20)
		.attr("text-anchor", "start")
		.selectAll("g")
		.data(keys.slice())
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 45 + ")"; });

	legend.append("rect")
		.attr("x", width1 + 25)
		.attr("y", height1 - 350)
		.attr("width", 35)
		.attr("height", 35)
		.attr("fill", z_1)
		.attr("stroke", z_1)
		.attr("stroke-width", 5)
		.attr("stroke-height", 5)
		.on("click",function(d) { update(d) });

	legend.append("text")
		.attr("x", width1 + 70)
		.attr("y", height1 - 330)
		.attr("dy", "0.32em")
		.text(function(d) { return d; });

	var filtered = [];

	function update(d) {

		// Update the array to filter the chart by:
		// add the clicked key if not included:
		if (filtered.indexOf(d) == -1) {
			filtered.push(d);
			// if all bars are un-checked, reset:
			if(filtered.length == keys.length) filtered = [];
		}
		// otherwise remove it:
		else {
			filtered.splice(filtered.indexOf(d), 1);
		}

		// Update the scales for each group(/access_prov_types)'s items:
		var newKeys = [];
		keys.forEach(function(d) {
			if (filtered.indexOf(d) == -1 ) {
				newKeys.push(d);
			}
		})

		y1_1.domain(newKeys).rangeRound([0, y0_1.bandwidth()]);
		x_1.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

		// update the x axis:
		svg1.select(".x")
			.transition()
			.call(d3.axisBottom(x_1).ticks(10))
			.duration(500);

		// Filter out the bands that need to be hidden:
		var bars = svg1.selectAll(".bar").selectAll("rect")
			.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

		bars.filter(function(d) {
				return filtered.indexOf(d.key) > -1;
			})
			.transition()
			.attr("y", function(d) {
				return (+d3.select(this).attr("y")) + (+d3.select(this).attr("height")) / 2;
			})
			.attr("height", 0)
			.attr("width", 0)
			.attr("x", function(d) { return width1 - x_1(d); })
			.duration(500);

		// Adjust the remaining bars:
		bars.filter(function(d) {
				return filtered.indexOf(d.key) == -1;
			})
			.transition()
			.attr("y", function(d) { return y1_1(d.key); })
			.attr("x", 0)
			.attr("height", y1_1.bandwidth())
			.attr("width", function(d) { return x_1(d.value); })
			.attr("fill", function(d) { return z_1(d.key); })
			.duration(500);

		// update legend:
		legend.selectAll("rect")
			.transition()
			.attr("fill",function(d) {
				if (filtered.length) {
					if (filtered.indexOf(d) == -1) {
						return z_1(d);
					}
					else {
						return "white";
					}
				}
				else {
					return z_1(d);
				}
			})
			.duration(100);
	}
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var svg2 = d3.select("#svg2"),
	margin2 = {top: 20, right: 250, bottom: 20, left: 200},
	width2 = +svg2.attr("width") - margin2.left - margin2.right,
	height2 = +svg2.attr("height") - margin2.top - margin2.bottom,
	g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var x_2 = d3.scaleLinear()
	.rangeRound([0, width2]);

// The scale spacing the groups:
var y0_2 = d3.scaleBand()
	.rangeRound([height2, 0])
	.paddingInner(0.1);

// The scale for spacing each group's bar:
var y1_2 = d3.scaleBand()
	.padding(0.05);

var z_2 = d3.scaleOrdinal()
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("access_summary_unnormalized.csv", function(d, i, columns) {
	for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
	return d;
}).then(function(data) {
	console.log(data);

	var keys = data.columns.slice(1);

  data.sort(function(a, b) { return a.Total - b.Total; });

  x_2.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
	y0_2.domain(data.map(function(d) { return d.access_prov_type; }));
	y1_2.domain(keys).rangeRound([0, y0_2.bandwidth()]);

	g2.append("g")
		.selectAll("g")
		.data(data)
		.enter().append("g")
			.attr("class","bar")
			.attr("transform", function(d) { return "translate(0," + y0_2(d.access_prov_type) + ")"; })
		.selectAll("rect")
		.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append("rect")
			.attr("y", function(d) { return y1_2(d.key); })
			.attr("x", 0)
			.attr("height", y1_2.bandwidth())
			.attr("width", function(d) { return x_2(d.value); })
			.attr("fill", function(d) { return z_2(d.key); });

	g2.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height2 + ")")
		.call(d3.axisBottom(x_2).ticks(10))
		.append("text")
			.attr("x", 2)
			.attr("y", margin2.left * 0.8 * -1)
			.attr("dy", "0.32em")
			.attr("fill", "#000")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start");

	g2.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(y0_2))
		.selectAll("text")
			.style("text-anchor", "end");

	var legend = g2.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 20)
		.attr("text-anchor", "start")
		.selectAll("g")
		.data(keys.slice())
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 45 + ")"; });

	legend.append("rect")
		.attr("x", width2 + 25)
		.attr("y", height2 - 350)
		.attr("width", 35)
		.attr("height", 35)
		.attr("fill", z_2)
		.attr("stroke", z_2)
		.attr("stroke-width", 5)
		.attr("stroke-height", 5)
		.on("click",function(d) { update(d) });

	legend.append("text")
		.attr("x", width2 + 70)
		.attr("y", height2 - 330)
		.attr("dy", "0.32em")
		.text(function(d) { return d; });

	var filtered = [];

	function update(d) {

		// Update the array to filter the chart by:
		// add the clicked key if not included:
		if (filtered.indexOf(d) == -1) {
			filtered.push(d);
			// if all bars are un-checked, reset:
			if(filtered.length == keys.length) filtered = [];
		}
		// otherwise remove it:
		else {
			filtered.splice(filtered.indexOf(d), 1);
		}

		// Update the scales for each group(/access_prov_types)'s items:
		var newKeys = [];
		keys.forEach(function(d) {
			if (filtered.indexOf(d) == -1 ) {
				newKeys.push(d);
			}
		})

		y1_2.domain(newKeys).rangeRound([0, y0_2.bandwidth()]);
		x_2.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

		// update the x axis:
		svg2.select(".x")
			.transition()
			.call(d3.axisBottom(x_2).ticks(10))
			.duration(500);

		// Filter out the bands that need to be hidden:
		var bars = svg2.selectAll(".bar").selectAll("rect")
			.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

		bars.filter(function(d) {
				return filtered.indexOf(d.key) > -1;
			})
			.transition()
			.attr("y", function(d) {
				return (+d3.select(this).attr("y")) + (+d3.select(this).attr("height")) / 2;
			})
			.attr("height", 0)
			.attr("width", 0)
			.attr("x", function(d) { return width2 - x_2(d); })
			.duration(500);

		// Adjust the remaining bars:
		bars.filter(function(d) {
				return filtered.indexOf(d.key) == -1;
			})
			.transition()
			.attr("y", function(d) { return y1_2(d.key); })
			.attr("x", 0)
			.attr("height", y1_2.bandwidth())
			.attr("width", function(d) { return x_2(d.value); })
			.attr("fill", function(d) { return z_2(d.key); })
			.duration(500);

		// update legend:
		legend.selectAll("rect")
			.transition()
			.attr("fill",function(d) {
				if (filtered.length) {
					if (filtered.indexOf(d) == -1) {
						return z_2(d);
					}
					else {
						return "white";
					}
				}
				else {
					return z_2(d);
				}
			})
			.duration(100);
	}
});
