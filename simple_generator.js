


let stator_radius = 200


// inner = h, !inner = e
let circles = [
    { radius: 50, inner: true},
    { radius: 20, inner: false}
]

let pen_radius = 38 // last circle radius 


// not important
let pen_width = 10




let main_rotor_degree_increment = 1

// center of circle, angle of canonical line from center in radians
let circle_states = [
    { center: [200 - 50, 0], angle: 0},
    { center: [200 + 10, 0], angle: 0}
]

function convert_x_y_to_canvas(x, y, canvas) {
	var right = (canvas.width / 2) + x
	var down = (canvas.height / 2) - y
	console.log(y, down)
	return {right: right, down: down}
}


function draw_point(x, y) {	
	var canvas = document.getElementById("canvas");
	var coords = convert_x_y_to_canvas(x, y, canvas)
	var pointSize = 1
  	var ctx = canvas.getContext("2d");
  	ctx.fillStyle = "#ff2626"; // Red color
	ctx.beginPath();
    ctx.arc(coords.right, coords.down, pointSize, 0, Math.PI * 2, true);
    ctx.fill();
}


big_radius = 200
small_radius = 100
pen_radius = 120


function get_pen_coords(t_big) {
	// contained circle angle radians
	t_small = -(big_radius - small_radius) * t_big / small_radius
	
	x_small_c = (big_radius - small_radius) * Math.cos(t_big)
	y_small_c = (big_radius - small_radius) * Math.sin(t_big)

	x_pen_offset = pen_radius * Math.cos(t_small) 
	y_pen_offset = pen_radius * Math.sin(t_small) 

	x_pen = x_small_c + x_pen_offset
	y_pen = y_small_c + y_pen_offset

	console.log(x_pen, y_pen)

	return {x: x_pen, y: y_pen}
}


// run
var theta_increment = Math.PI / 180

// big circle angle radians
var t_big = 0 

var pen = {
	x: big_radius - small_radius + pen_radius,
	y: 0
}

while (t_big < Math.PI * 4) {
	draw_point(pen.x, pen.y)
	t_big += theta_increment
	pen = get_pen_coords(t_big)
	//setTimeout	
		
}






