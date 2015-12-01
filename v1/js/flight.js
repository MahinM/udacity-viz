
var width = 1000,
    height = 600;

var active = d3.select(null);
var flying = false;
var pause = false;

var projection = d3.geo.equirectangular()
    .scale(550)
    .translate([width*1.6, height*1.2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);


  var svg = d3.select("#map svg")
              .attr("preserveAspectRatio", "xMidYMid")
              .attr("viewBox", "0 0 " + width + " " + height);
              

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g")
  .style("stroke-width", "1.5px");


var airportMap = {};

var od_pairs = [];

var button = d3.select("#animation_toggle")
  .on("click", toggle_animation);

var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");





function toggle_animation(){
  if (flying === false){
    flying = true;
    button.text("Turn animation off"); 
    d3.selectAll(".plane").attr("display","display");   
  }
  else{
     flying = false;
     button.text("Turn animation on");
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

  function fly(origin, destination) {

    if (flying === true && pause === false){
      var route = svg.append("path")
                   .datum({type: "LineString", coordinates: [airportMap[origin], airportMap[destination]]})
                   .attr("class", "route")
                   .attr("d", path);

      var plane = svg.append("path")
                   .attr("class", "plane")
                   .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z");
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

function clicked(d){

  pause = true;
  d3.selectAll(".plane").attr("display","none");

  if (active.node() === this) 
      return reset();

  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  //button.classed("hidden",true);
  
  var state_id = active.datum().id;

  d3.selectAll(".airports")
    .attr("display", function(d) {
                      if (d.id != state_id)
                        return "none";
                      return "display";
                    })
    .attr("r", function(){ return +this.attributes.r.value - 1;} );//Make radius a bit smaller

  //select all features (states) except for the active one.  Turn them off...
  d3.selectAll(".feature:not(.active), #state-borders, #animation_toggle")
    .classed("hidden", true)
    .transition()
    .ease("linear");
    //.attr("display","none");


  //This is a hack... Not sure how to make this work right for Alaska
  if (state_id == 2){
    scale = 2.5;
    translate = [150,30];
  }
  else{
    var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x  = (bounds[0][0] + bounds[1][0]) / 2,
      y  = (bounds[0][1] + bounds[1][1]) / 2,
      scale = 0.9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];
  }
    g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

}

function reset(){
  active.classed("active", false);
  active = d3.select(null);


  g.transition()
    .duration(750)
    .style("stroke-width", "1.5px")
    .attr("transform","");

  //Turn all airports visible again.  
  d3.selectAll(".airports")
    .transition()
    .delay(600)
    .attr("display","display")
    .attr("r", function(d) { 
          if (d.state === "AK"){
            return 3;//In the projection, Alaska appears visually closer
          }
          else return 2;
        })
      ;

  //Turn states and borders visible again.
  d3.selectAll(".feature, #state-borders, #animation_toggle")
    .classed("hidden", false);
    

  //un-pause flight animation
  pause = false;
  
}





function loaded(error, us, airports, od){
  
  if (error) throw error;

  //Create a names object to associate ids and state names
  var names = {};
  airports.forEach(function(d){
    names[d.id] = d.state_name;
  });
  


  var states = g.append("g")
    .attr("id","states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features) //array of state objects
    .enter().append("path")
    .attr("d", path)
    .attr("class", "feature")
    .on("click",clicked);


//offsets for tooltips
  //var offsetL = document.getElementById('map').offsetLeft;
  //var offsetT = document.getElementById('map').offsetTop;

  //tooltips
  states.on("mousemove", function(d,i) {

      var mouse = d3.mouse(svg.node()).map( function(d) {  return parseInt(d); } );
      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0])+"px;top:"+(mouse[1])+"px")
             .html(names[d.id]);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      }); 



  
  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a,b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d",path);

  g.selectAll(".airports")
    .data(airports)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return projection([d.long,d.lat])[0];})
      .attr("cy", function(d){ return projection([d.long,d.lat])[1];})
      .attr("r", function(d) { 
          if (d.state === "AK"){
            return 3;//In the projection, Alaska appears visually closer
          }
          else return 2;
        })
      .attr("class","airports");
      //.style("fill","red");




      

  //AirportMap is like an associative array where the airport code are the 
  //keys and the coordinates are the values.
    airports.forEach(function(d) {
      airportMap[d.airport_code] = [d.long,d.lat];
      });

  //Shuffle the origin/destination pairs.
  od_pairs = shuffle(od);
  flying = true;
  
  var i = 0;
  var interval = 300;
  setInterval(function() {
    //Create continuous loop
    if (i > od.length - 1) {
      i = 0;
    }
    
    fly(od[i].Origin, od[i].Dest);
    i++;
  }, interval);//Run function every x milliseconds



  //small_states();



}


queue().defer(d3.json, "./data/us.json")
  .defer(d3.csv, "./data/airports.csv")
  .defer(d3.csv, "./data/origin_destination.csv")
  .await(loaded);


function small_states(){

  //Place boxes for small states
  var small_states = ['NH','VT','MA','RI','CT','DC','DE','PR'];

  var rect_dim = 30;
  var barPadding = 1;
    
  var w = (rect_dim) * 2 + 10;
  var h = Math.ceil(small_states.length / 2) * rect_dim + 10;
    
  //var svg = d3.select("svg");     
          
    
  var g = svg.selectAll("g")
      .data(small_states)
      .enter().append("g")      
      .attr("transform", "translate(920,350)");

    
  g.append("rect")      
      .attr("width", rect_dim)
      .attr("height", rect_dim)
      .attr("x", function(d,i) { return i%2 * (rect_dim + barPadding);})
      .attr("y", function(d,i) { return Math.floor(i/2) * (rect_dim + barPadding);})
      .attr("class", "button");
      
      
  g.append("text")
      .text(function(d) { return d;})
      .attr("x", function(d,i) { return i%2 * (rect_dim + barPadding) + rect_dim/2})
      .attr("y", function(d,i) { return Math.floor(i/2) * (rect_dim + barPadding) + rect_dim * 0.67;});

}