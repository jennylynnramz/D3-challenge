var svgWidth = 970;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 20,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chartData = null

var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

var xAxisLabels = ["poverty", "age", "income"];

var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };
  
  // function used for updating x-scale var upon click on axis label
  function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * .9,
        d3.max(healthData, d => d[chosenXAxis] * 1.1)])
      .range([0, width]);
    return xLinearScale;
  }

  function yScale(healthData, chosenYAxis) {
    // Create Scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis] * .9) , //1.4
            d3.max(healthData, d => d[chosenYAxis] * 1.1)  ]) //.6
        .range([height, 0]);
  
    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label.
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
          .duration(1000)
          .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis])) 
      .attr("cy", d => newYScale(d[chosenYAxis])); 

    return circlesGroup;
  }

function renderCircleText(circleText, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
        
  return circleText;
}
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Median Income: "
  }
  else {
    var xlabel = "Age: "
  }

    //yaxis selection
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers: "
  }
  else {
    var ylabel = "Obesity: "
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background", "grey")
    .style("color", "white")
    .offset([120, -60]) //a style choice, not a functional one
    .html(function(d) {
      if (chosenXAxis === "age") {
        return (`<h3><center>${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]} </center></h3>`);
        } else if (chosenXAxis !== "age" && chosenXAxis !== "poverty") {
          return (`${d.state}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
        } else {
          return (`${d.state}<br>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
        }
      });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    })
    // onmouseout event
      .on("mouseout", function(data, index) { ///index doesn't seem to serve a purpose in this case
        toolTip.hide(data)
      });

    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;

    // parse data
    healthData.forEach(function(data) {
      healthData.state = data.state;
      healthData.abbr = data.abbr;
      healthData.poverty = +data.poverty;
      healthData.age = +data.age;
      healthData.income = +data.income;
      healthData.healthcare = +data.healthcare;
      healthData.obesity = +data.obesity;
      healthData.smokes = +data.smokes;
    });

    // xLinearScale function
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter() 
      .append("circle") //adding the "circle" to the html to be attached to
      .attr("cx", d => xLinearScale(d[chosenXAxis])) 
      .attr("cy", d => yLinearScale(d[chosenYAxis])) 
      .attr("r", "15") //circle radius
      .attr("fill", "teal") //circle color, style not function
      .attr("opacity", ".8"); //circle opacity, style not function

    var circleText = chartGroup.selectAll()
      .data(healthData)
      .enter()
      .append("text")
      .text(d => (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style("fill", "purple");


    //axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 30})`); //adjusts the placement of the bottom axis labels. mostly style, some function

    //X-AXIS label 1 of 3
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "poverty") // value to grab for event listener.
      .classed("active", true)
      .text("Poverty (%)");

    //X-AXIS label 2 of 3
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age") // value to grab for event listener.
      .classed("inactive", true)
      .text("Median Age");

    //X-AXIS label 3 of 3
    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener.
      .classed("inactive", true)
      .text("Median Household Income");

    //Y-AXIS label 1 of 3
    var healthcareLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.8)
      .attr("y", 0 - (height + 12)) 
      .attr("value", "healthcare") // value to grab for event listener.
      .classed("active", true)
      .text("Lacks Healthcare %");

    //Y-AXIS label 2 of 3
    var smokeLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.8)
      .attr("y", 0 - (height +32))
      .attr("value", "smokes") // value to grab for event listener.
      .classed("inactive", true)
      .text("Smokes (%)");
      
    //Y-AXIS label 3 of 3
    var obesityLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.8)
      .attr("y", 0 - (height +52))
      .attr("value", "obesity") // value to grab for event listener.
      .classed("inactive", true)
      .text("Obesity (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value)


        if (true) {
          if (value === "poverty" || value === "age" || value === "income") {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Update circles text with new values.
          circleText = renderCircleText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);

            ageLabel
              .classed("active", false)
              .classed("inactive", true);

            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age"){
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);

            ageLabel
              .classed("active", true)
              .classed("inactive", false);

            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);

            ageLabel
              .classed("active", false)
              .classed("inactive", true);

            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }}

      else {
        chosenYAxis = value;
            // console.log(chosenYAxis)

            // updates y scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Update circles text with new values.
            circleText = renderCircleText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
          if (chosenYAxis === "healthcare") {

            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);

            smokeLabel
              .classed("active", false)
              .classed("inactive", true);

            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes"){
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);

              smokeLabel
              .classed("active", true)
              .classed("inactive", false);

              obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);

              smokeLabel
              .classed("active", false)
              .classed("inactive", true);
              
              obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      }
      });
  }).catch(function(error) {
    console.log(error);
  });
