
var width = 1000,
    height = 600;

var flying = false;

/*var projection = d3.geo.equirectangular()
    .scale(550)
    .translate([width*1.6, height*1.2])
    .precision(.1);
*/
var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);


var path = d3.geo.path()
    .projection(projection);


d3.selectAll(".map svg")
              .attr("preserveAspectRatio", "xMidYMid")
              .attr("viewBox", "0 0 " + width + " " + height)
              ;

var g = d3.selectAll(".map svg").append("g")
  .style("stroke-width", "1.5px");

var rScale = d3.scale.linear()
              .range([3,20]);

              
/*
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
*/




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






function loaded(error, us, airports, od,busy){
  
  if (error) throw error;

  //Create a names object to associate ids and state names
  var names = {};
  airports.forEach(function(d){
    names[d.id] = d.state_name;
  });
  



  /*Shape the topojson data to include only continental US*/
  us.objects.cb_2014_us_state_20m.geometries = 
    us.objects.cb_2014_us_state_20m.geometries
      .filter(function(d){if(["Alaska","Hawaii", "Puerto Rico"].indexOf(d.id) == -1){return d}});



  var states = g.append("g")
    .attr("id","states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.cb_2014_us_state_20m).features) //array of state objects
    .enter().append("path")
    .attr("d", path)
    .attr("class", "feature");

/*
  g.append("path")
    .datum(topojson.mesh(us, us.objects.cb_2014_us_state_20m, function(a,b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d",path);
*/

//  var airports = d3.select("#map_animation svg g");


  d3.select("#map_animation g").selectAll(".airports")
    .data(airports)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return projection([d.long,d.lat])[0];})
      .attr("cy", function(d){ return projection([d.long,d.lat])[1];})
      .attr("r", 2) 
      .attr("class","airports");


  rScale.domain([0, d3.max(busy, function(d) { return +d.Count;})]);

  d3.select("#map_volume g").selectAll(".airports")
    .data(busy)
    .enter()
    .append("circle")
    .attr("cx", function(d){ return projection([d.long,d.lat])[0];})
      .attr("cy", function(d){ return projection([d.long,d.lat])[1];})
      .attr("r", function(d) { return rScale(+d.Count);})
      .attr("fill", function(d){ if (d.Delay_Rate > 0.21)  return '#C0163D';
                                  else return '#042C6A';})
      .attr("opacity", 0.3); 

      //.attr("class","airports");

  var columns = ['state', 'airport_name', 'Count', 'Delay_Percent'];

  busy.forEach(function(d){
              d.Count = d3.format(',')(+d.Count);
              d.Delay_Percent = d3.format(".0%")(+d.Delay_Rate);
  });

  var table = d3.select("#table_volume");

  var tbody = table.append('tbody');

  var rows = tbody.selectAll("tr")
              .data(busy)
              .enter()
              .append("tr");

  var cells = rows.selectAll("td")
              .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr("style", "font-family: Courier") // sets the font style
            .html(function(d) { return d.value; });

      
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
  .await(loaded);


