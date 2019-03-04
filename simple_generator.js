
function split_circle_line(radius_type) {
    var match = /^(\d+)(h|e)$/.exec(radius_type);
    if (match) {
        const [full_match, radius, type] = match;
        return { radius: parseInt(radius), inner: type == 'h' }
    } else {
        return null;
    }
}


function draw_line(angle, offset, length, canvas_id) {
    var canvas = document.getElementById(canvas_id);
    
    let end_x = length * Math.cos(angle) + offset.x
    let end_y = length * Math.sin(angle) + offset.y

    let start = convert_x_y_to_canvas(offset.x, offset.y, canvas)
    let end = convert_x_y_to_canvas(end_x, end_y, canvas)
    
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.right, start.down);
    ctx.lineTo(end.right, end.down);
    ctx.stroke();
}


function clear_canvas(canvas_id) {
	var canvas = document.getElementById(canvas_id);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}


function convert_x_y_to_canvas(x, y, canvas) {
	var right = (canvas.width / 2) + x
	var down = (canvas.height / 2) - y
	return {right: right, down: down}
}

function draw_2_point_line(start_point, end_point, color, canvas_id) {	
    var canvas = document.getElementById(canvas_id);
    
    let start = convert_x_y_to_canvas(start_point.x, start_point.y, canvas)
    let end = convert_x_y_to_canvas(end_point.x, end_point.y, canvas)
   
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.right, start.down);
    ctx.lineTo(end.right, end.down);
    ctx.stroke();
}


    
function draw_point(x, y, color, canvas_id) {	
	var canvas = document.getElementById(canvas_id);
	var coords = convert_x_y_to_canvas(x, y, canvas)
	var pointSize = 1
  	var ctx = canvas.getContext("2d");
  	ctx.fillStyle = color
	ctx.beginPath();
    ctx.arc(coords.right, coords.down, pointSize, 0, Math.PI * 2, true);
    ctx.fill();
}

function draw_circle(x, y, radius, color, canvas_id) {	
    var canvas = document.getElementById(canvas_id);
    var coords = convert_x_y_to_canvas(x, y, canvas)
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(coords.right, coords.down, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function get_point(radius, angle, offset) {
    return {
        x: radius * Math.cos(angle) + offset.x,
        y: radius * Math.sin(angle) + offset.y
    }
}


function get_pen_coords(t_big) {
	// contained circle angle radians
	const t_small = -(big_radius - small_radius) * t_big / small_radius
	
	const x_small_c = (big_radius - small_radius) * Math.cos(t_big)
	const y_small_c = (big_radius - small_radius) * Math.sin(t_big)
	
    const x_pen_offset = pen_radius * Math.cos(t_small) 
	const y_pen_offset = pen_radius * Math.sin(t_small) 

	const x_pen = x_small_c + x_pen_offset
	const y_pen = y_small_c + y_pen_offset

	return {x: x_pen, y: y_pen}
}

function get_small_offset_angle(big_radius, small_radius, t_big, offset_big) {
    const t_small = -(big_radius - small_radius) * t_big / small_radius
	const x_small_offset = (big_radius - small_radius) * Math.cos(t_big)
	const y_small_offset = (big_radius - small_radius) * Math.sin(t_big)
	return {
        x: offset_big.x + x_small_offset,
        y: offset_big.y + y_small_offset,
        angle: t_small
    }
}

function get_pen_from_last_circle(circle_offset, circle_angle, pen_radius) {
	const x_pen_offset = pen_radius * Math.cos(circle_angle) 
	const y_pen_offset = pen_radius * Math.sin(circle_angle) 
    return {
        x: circle_offset.x + x_pen_offset,
        y: circle_offset.y + y_pen_offset
    }
}


// num loop inside parent in single first child loop
function get_revolutions(rotations) {
    var revolutions = [0, 1]
    for (var c = 2; c < rotations.length; c++) {
        revolutions[c] = (rotations[c-1] - rotations[c-2]) + revolutions[c-1]
    }
    return revolutions
}

// num 2pi rotations of circle in single first child loop
function get_rotations(circles) {
    var rotations = [0]
    for (var c = 1; c < circles.length; c++) {
        const parent = circles[c-1]
        const child = circles[c]    
        const R = parent.radius
        const r = child.radius
        const rotation_increase = child.inner ? (R - r)/r : (R + r)/r
        rotations[c] = rotation_increase + rotations[c-1]
    }
    return rotations
}

const CW = -1 // clockwise
const CCW = 1 // counter clockwise
const same = x => x
const opposite = x => -x
function get_rotate_directions(circles) {
    const directions = [null]; 
    directions[1] = circles[1].inner ? CW : CCW
    for (var c = 2; c < circles.length; c++) {
        directions[c] = circles[c].inner ? same(directions[c-1]) : opposite(directions[c-1])
    }
    return directions 
}

function get_revolve_directions(circles, rotate_directions) {
    const directions = [null]; 
    for (var c = 1; c < circles.length; c++) {
        directions[c] = circles[c].inner ? opposite(rotate_directions[c]) : same(rotate_directions[c])
    }
    return directions 
}





// run ////////////////////////////////////




////// global values for step function /////
const pen_radius = 38

// initialize
let theta_increment = 0
let circles = []
let rotations = []
let revolutions = []
let rotate_directions = [] 
let revolve_directions = [] 

let points = []


// big circle angle radians
let t_biggest = 0 

// TODO change to be time based
function step() {
   
    let offset = {x: 0, y: 0}

    // draw stator
    draw_circle(offset.x, offset.y, circles[0].radius, "#ff26ff", "canvas-refreshing")

    for (var i = 1; i < circles.length; i++) {
        var parent_radius = circles[i-1].radius 
        var radius = circles[i].radius 
       
        var angle_around = revolve_directions[i] * revolutions[i] * t_biggest 
        var center_radius = circles[i].inner ? parent_radius - radius : parent_radius + radius

        var center = get_point(center_radius, angle_around, offset)

        draw_circle(center.x, center.y, radius, "#ff26ff", "canvas-refreshing")
        
        var angle_rotated = rotate_directions[i] * rotations[i] * t_biggest 
        draw_line(angle_rotated, center, radius, "canvas-refreshing")
        
        offset = center
    } 
        
      
    // draw spirograph point and pen line
    var angle_rotated = rotate_directions[i-1] * rotations[i-1] * t_biggest 
    var spiro = get_point(pen_radius, angle_rotated, offset)
    points.push(spiro)
    draw_point(spiro.x, spiro.y, "#0000ff", "canvas-static")
    draw_line(angle_rotated, offset, pen_radius, "canvas-refreshing")
    
    if (points.length >= 2) {
        draw_2_point_line(points[points.length-1], points[points.length-2], "#ff2626", "canvas-static")
    } 

	t_biggest += theta_increment

    setTimeout(function () { clear_canvas("canvas-refreshing") } , 10)
    // stop drawing
    if (t_biggest <= 4 * Math.PI) {
        window.requestAnimationFrame(step);
    } else {
        console.log("Number sample points: " + points.length)
        draw_2_point_line(points[points.length-1], points[0],  "#ff2626", "canvas-static")
    } 
}


function startAnimation() {
    clear_canvas("canvas-refreshing")
    clear_canvas("canvas-static")

    numSamplePoints = parseInt(document.getElementById("sample-points").value)
    
    let lines = document.getElementById("radius-input").value.split("\n").filter(line => line.length > 0)
    circles = lines.map(split_circle_line);
    console.log(circles)
   
    if (circles.length < 2) {
        //alert("Must input at least 2 comma separated radii");
        return;
    }
    t_biggest = 0; // reset
    points = []

    rotations = get_rotations(circles)
    revolutions = get_revolutions(rotations)
    rotate_directions = get_rotate_directions(circles)
    revolve_directions = get_revolve_directions(circles, rotate_directions)
    theta_increment = (2 * Math.PI) / numSamplePoints 

    window.requestAnimationFrame(step);
}





// on load code  ////////////////////////////////////////////////
window.onload = function () {
       document.getElementById("start-animation").onclick=startAnimation;
}

