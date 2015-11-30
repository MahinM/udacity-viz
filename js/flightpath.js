// Enables the Popovers
$(function () { $("[data-toggle='popover']").popover({html:true}); });


var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var flying = false;

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);


var path = d3.geo.path()
    .projection(projection);


var airportMap = {};

var od_pairs = [];

var button = d3.select("#animation_toggle")
  .on("click", toggle_animation);





function toggle_animation(){
  if (flying === false){
    flying = true;
    button.text("Animation Off"); 
    d3.selectAll(".plane").attr("display","display");   
  }
  else{
     flying = false;
     button.text("Animation On");
     d3.selectAll(".plane").attr("display","none");
     //.remove();
    }
}


  function transition(plane, route) {
    var l = route.node().getTotalLength();
    if (l < 100)
      l = l * 2; // make the short routes slower
    plane.transition()
        .duration(l * 100)
        .attrTween("transform", delta(plane, route.node()))
        .each("end", function() { route.remove(); })
        .remove();
  }
  
  function delta(plane, path) {
    var l = path.getTotalLength();
    var plane = plane;
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(t * l);

        var t2 = Math.min(t + 0.05, 1);
        var p2 = path.getPointAtLength(t2 * l);

        var x = p2.x - p.x;
        var y = p2.y - p.y;
        var r = 90 - Math.atan2(-y, x) * 180 / Math.PI;

        var s = Math.min(Math.sin(Math.PI * t) * 1.4, 0.6);

        return "translate(" + p.x + "," + p.y + ") scale(" + s + ") rotate(" + r + ")";
      }
    }
  }

  function fly(origin, destination, delay) {

    if (flying === true){
      var svg = d3.select("#map_animation");

      var route = svg.append("path")
                   .datum({type: "LineString", coordinates: [airportMap[origin], airportMap[destination]]})
                   .attr("class", "route")
                   .attr("d", path);

      var plane = svg.append("path")
                   .attr("class", "plane")
                   .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z")
                   .attr("fill", function(){if (delay == 1) return '#C0163D';
                                            else return '#042C6A';});
      transition(plane, route);
    }
  }

//http://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}


function airline_delay(data){
    var margin = {top: 20, right: 20, bottom: 45, left: 150},
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var y = d3.scale.ordinal()
            .rangeRoundBands([height,0], .1);

    var x = d3.scale.linear()
            .rangeRound([0,width]);

    var color = d3.scale.ordinal()
            .range(['#C0163D','#042C6A' ]);

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.format(".2s"));

    var svg = d3.select("#airline")
              .attr("preserveAspectRatio", "xMidYMid")
              .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + 
                (height + margin.top + margin.bottom)); ;

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.tip()
                .attr("class", "d3-tip")  
                .offset([-10, 0])
                    .html(function (d) { 
                      return "<strong>" + d.airline_name + "</strong><br/>" + d.name + ": " + d3.format(',')(d.x1)
                      + " (" + d3.format(".0%")(d.rate) + ")";          
                    });  

    g.call(tip);


    color.domain(['Delayed','On time']);

    data.forEach(function(d){
      var x0 = 0;
      var rate = 0;
      d.flights = color.domain().map(function(name) { if (name=='Delayed') rate = +d.delayed_rate;
                                                      else rate = (1- +d.delayed_rate);
                                                      return {airline_name: d.airline_name, 
                                                      rate: rate,
                                                      name: name, x0: x0, x1: x0 += +d[name]};});
      d.total = +d.total;
    });
    

    data.sort(function(a, b) { return a.total - b.total; });

    y.domain(data.map(function(d) { return d.airline_code; }));
    x.domain([0, d3.max(data, function(d) { return d.total; })]);

    g.append("g")
      .attr("class", "yaxis axis")
      //.attr("transform", "translate(0," + width + ")")
      .call(yAxis);

  g.append("g")
      .attr("class", "xaxis axis")
      .call(xAxis)
      .attr("transform", "translate(0," + height+")")
      .append("text")
      .attr("text-anchor", "middle")  
      .attr("transform", "translate("+ (width/2) +",40)")  
            .text("Flights Per Year");


    
  svg.select(".yaxis").selectAll("text").remove();

  var ticks = svg.select(".yaxis").selectAll(".tick")
                    .data(data)
                    .append("svg:image")
                    .attr("xlink:href", function (d) { return d.logo ; })
                    .attr("width", 100)
                    .attr("height", 100)
                    .attr("x", -120)
                    .attr("y", -50);

  var airline_item = g.selectAll(".airline")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(0," + y(d.airline_code) + ")"; });

  var bar = airline_item.selectAll("rect")
      .data(function(d) { return d.flights; })
    .enter().append("rect")
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return x(d.x0); })
      .attr("width", function(d) { return x(d.x1) - x(d.x0); })
      .attr("opacity", "0.7")
      .style("fill", function(d) { return color(d.name); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  

  var legendRectSize = 18;
  var legendSpacing = 25;

  var legend_data = [{color: "#C0163D", label: "Delayed departure"}, 
                     {color: "#042C6A", label: "On time departure" }];

  var legend = svg.selectAll('.legend')
      .data(legend_data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var legend_height = height - (legendRectSize );
        var horz = width-10;
        var vert = legend_height - (i * (legendRectSize + legendSpacing));
        return 'translate(' + horz + ',' + vert + ')';
      });

  legend.append("rect")
    .attr("width", legendRectSize )
    .attr("height", legendRectSize )
    .attr("fill", function(d){ return d.color;})

  legend.append("text")
    .attr('x', legendRectSize + legendSpacing/2)
    .attr('y', legendRectSize - legendSpacing/4)
    .text(function(d){ return d.label;})



}

function airport_delay(data){

  data = data.slice(0,22);
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var radius = d3.scale.sqrt()
    .range([0, 25]);

  //delay rate
  var y = d3.scale.linear()
      .rangeRound([height,0]);

  //delay length
  var x = d3.scale.linear()
      .range([0,width]);

  var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".0%"));

  var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(d3.format(".2s"));              

  data.forEach(function(d){
    d.ave_delay = +d.Ave_delay;
    d.delay_rate = +d.Delay_Rate;
    d.total = +d.Count;
  });

  y.domain([0,d3.max(data,function(d){return d.delay_rate;})]);
  //y.domain(d3.extent(data,function(d){return d.delay_rate;}));
  x.domain([40, d3.max(data,function(d){return d.ave_delay;})]);
  //x.domain(d3.extent(data,function(d){return d.ave_delay;}));
  radius.domain([0, d3.max(data, function(d) { return +d.Count;})]);

  /*Bubble chart*/
var svg = d3.select("#bubble_chart")
          .attr("preserveAspectRatio", "xMidYMid")
          .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + 
                (height + margin.top + margin.bottom));            
              ;
 
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.append("g")
      .attr("class", "yaxis axis")
      .call(yAxis)
      .append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (margin.left/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Flight Delay Rate");      
      //.attr("transform", "translate(" + margin.left + ",0)");
;

  g.append("g")
      .attr("class", "xaxis axis")
      .call(xAxis)
      .attr("transform", "translate(0," + height + ")")
      .append("text")
      .attr("text-anchor", "middle")  
      .attr("transform", "translate("+ (width/2) +",-10)")  
            .text("Average Flight Delay (minutes)");
;
  var airport = g.append("g")
                  .attr("class","bubble");

      
  airport.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", function(d){ return x(d.ave_delay);})
      .attr("cy", function(d){ return y(d.delay_rate);})
      .attr("r", function(d) { return radius(d.total);}) 
      .attr("fill", function(d){  if (d.delay_rate > 0.21)  return '#C0163D';
                                  else return '#042C6A';})
      .append("title")
      .text(function(d) {
        return d.airport_code + ": " + d.airport_name +"\n" + d3.format(",")(d.total) + " flights per year"
                    + "\n" + d3.format(".0%")(d.delay_rate) + " delayed";
      });



}

function draw_maps(us){

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


  var svg = d3.selectAll(".map svg")
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + 
                (height + margin.top + margin.bottom));  ;

  /*Shape the topojson data to include only continental US*/
  us.objects.cb_2014_us_state_20m.geometries = 
    us.objects.cb_2014_us_state_20m.geometries
      .filter(function(d){if(["Alaska","Hawaii", "Puerto Rico"].indexOf(d.id) == -1){return d}});

  var g = d3.selectAll(".map svg").append("g")
    .style("stroke-width", "1.5px");


  var states = g.append("g")
    .attr("id","states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.cb_2014_us_state_20m).features) //array of state objects
    .enter().append("path")
    .attr("d", path)
    .attr("opacity",0.8)
    .attr("class", "feature");

/* //Draw state boundaries
  g.append("path")
    .datum(topojson.mesh(us, us.objects.cb_2014_us_state_20m, function(a,b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d",path);
*/

}


function draw_airports_volume(data){

  data = data.slice(0,25);

   data.forEach(function(d){
    d.ave_delay = +d.Ave_delay;
    d.delay_rate = +d.Delay_Rate;
    d.total = +d.Count;
  });

  
   var radius = d3.scale.sqrt()
    .range([0, 30]);

  radius.domain([0, d3.max(data, function(d) { return d.total;})]);



  var g = d3.select("#map_airport_volume g");

  var airport = g.append("g")
                  .attr("class","bubble");



    var tip = d3.tip()
  .attr("class", "d3-tip")  
  .offset([-10, 0])
      .html(function (d) { 
        return "<strong>" + d.airport_name + "</strong><br/>" 
                + d3.format(",")(d.total) + " flights in 2014<br/>"
                + d3.format(".0%")(d.delay_rate) + " delayed";
      });  

    g.call(tip);
                
  airport.selectAll(".airports")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d){ return projection([d.long,d.lat])[0];})
      .attr("cy", function(d){ return projection([d.long,d.lat])[1];})
      .attr("r", function(d) { return radius(d.total);})
      .attr("fill", function(d){ if (d.delay_rate > 0.21)  return '#C0163D';
                                  else return '#042C6A';})
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      ;


}


function draw_airports(data){
//Draw airports
  d3.select("#map_animation g").selectAll(".airports")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return projection([d.long,d.lat])[0];})
      .attr("cy", function(d){ return projection([d.long,d.lat])[1];})
      .attr("r", 2) 
      .attr("class","airports");

}

function draw_legend_animated_map(){


  var plane_path = "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z";

  var svg = d3.select("#map_animation");

  var legendRectSize = 18;
  var legendSpacing = 25;

  var legend_data = [{color: "#C0163D", label: "Delayed departure"}, 
                     {color: "#042C6A", label: "On time departure" }];


  var legend = svg.selectAll('.legend')
      .data(legend_data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var legend_height = height - (legendRectSize );
        var offset =  10;
        var horz = width-100;
        var vert = legend_height - (i * (legendRectSize + legendSpacing));
        return 'translate(' + horz + ',' + vert + ')';
      });

  legend.append("path")
    .attr("class", "plane")
    .attr("d", plane_path)
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing)
    .attr("fill", function(d){ return d.color;})

  legend.append("text")
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize + legendSpacing)
    .text(function(d){ return d.label;})

}

function draw_legend_airline_delay(){
  var svg = d3.select("#map_airport_volume");

  var legendRectSize = 18;
  var legendSpacing = 20;


  var legend_data = [{color: "#C0163D", label: "Higher than average delay rate"}, 
                     {color: "#042C6A", label: "Less than average delay rate" }];

  var legend = svg.selectAll('.legend')
      .data(legend_data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var legend_height = height - (legendRectSize );
        var horz = width-170;
        var vert = legend_height - (i * (legendRectSize + legendSpacing));
        return 'translate(' + horz + ',' + vert + ')';
      });

  legend.append("rect")
    .attr("width", legendRectSize )
    .attr("height", legendRectSize )
    .attr("fill", function(d){ return d.color;})

  legend.append("text")
    .attr('x', legendRectSize + legendSpacing/2)
    .attr('y', legendRectSize - legendSpacing/4)
    .text(function(d){ return d.label;})

   var radius = d3.scale.sqrt()
    .range([0, 30])
    .domain([0,500000]);

var circle_legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 50) + "," + (height - 70) + ")")
  .selectAll("g")
    .data([50000, 500000])
  .enter().append("g");

circle_legend.append("circle")
    .attr("cy", function(d) { return -radius(d); })
    .attr("r", radius)
    .attr("fill", "none")
    .attr("stroke", "#999");

circle_legend.append("text")
    .attr("y", function(d) { return -2 * radius(d); })
    .attr("dy", "1.3em")
    .attr("text-anchor","middle")
    .text(d3.format(".1s"));



}

function draw_delay_reasons(data){

  var margin = {top: 20, right: 75, bottom: 50, left: 170},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    //delay length
  var x = d3.scale.linear()
      .rangeRound([0,width]);

  //delay reason
  var y = d3.scale.ordinal()
      .rangeRoundBands([height,0],0.1);


  var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

  var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(d3.format(".2s"));

var svg = d3.select("#delay_reasons")
          .attr("preserveAspectRatio", "xMidYMid")
          .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + 
                (height + margin.top + margin.bottom))            
              ;
 
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

data.forEach(function(d){
      d.delay_mins = +d.delay_mins;
      d.delay_proportion = +d.delay_proportion;
  });

y.domain(data.map(function(d){ return d.delay_cause;}));
  x.domain([0, d3.max(data,function(d){ return d.delay_mins;})]);

g.append("g")
      .attr("class", "yaxis axis")
      .call(yAxis);

g.append("g")
      .attr("class", "xaxis axis")
      .call(xAxis)
      .attr("transform", "translate(0," + height+")")
      .append("text")
      .attr("text-anchor", "middle")  
      .attr("transform", "translate("+ (width/2) +",40)")  
            .text("Total Delay in Minutes");




g.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return y(d.delay_cause); })
      .attr("height", y.rangeBand())      
      .attr("width", function(d) { return x(d.delay_mins); })      
      .attr("fill", "#666")      
      ;

g.append("g").selectAll("text")
  .data(data)
  .enter()
  .append("text")
  .text(function(d) { if (d.delay_proportion < 0.001)
                        return d3.format('.1%')(d.delay_proportion);
                      else
                        return d3.format('.0%')(d.delay_proportion); })
  .attr("x", function(d){ return x(d.delay_mins) + 10;})
  .attr("y", function(d) { return y(d.delay_cause);})
  .attr("dy", function(d) {return y.rangeBand()/2;})
  .attr("font-family", "sans-serif")
  .attr("font-size", "16px")
  .attr("fill","black")
;





}



function loaded(error, us, airports, od,busy, airline, reasons){
  
  if (error) throw error;

 
  draw_maps(us);
  draw_airports(airports);
  draw_airports_volume(busy);
  airline_delay(airline);
  //Commenting out the airport delay bubble chart because the map chart provides the same info
  //airport_delay(busy); 

  draw_legend_animated_map();
  draw_legend_airline_delay();
  draw_delay_reasons(reasons);

      
  //AirportMap is like an associative array where the airport code are the 
  //keys and the coordinates are the values.
    airports.forEach(function(d) {
      airportMap[d.airport_code] = [d.long,d.lat];
      });

  //Shuffle the origin/destination pairs.
  od_pairs = shuffle(od);
  flying = true;
  
  var i = 0;
  var interval = 100;
  setInterval(function() {
    //Create continuous loop
    if (i > od_pairs.length - 1) {
      i = 0;
    }
    
    fly(od_pairs[i].Origin, od_pairs[i].Dest,+od_pairs[i].Delay);
    i++;
  }, interval);//Run function every x milliseconds


}


queue().defer(d3.json, "/data/us_continental.json")
  .defer(d3.csv, "/data/airports_continental.csv")
  .defer(d3.csv, "/data/od_continental.csv")
  .defer(d3.csv, "/data/busy_airports.csv")
  .defer(d3.csv, "/data/airline_delay.csv")
  .defer(d3.csv, "/data/delay_reasons.csv")
  .await(loaded);


