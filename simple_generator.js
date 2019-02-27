

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
function get_abs_t_rotations(rotations) {
    var abs_t_rotations = [0, 1]
    for (var c = 2; c < rotations.length; c++) {
        abs_t_rotations[c] = (rotations[c-1] - rotations[c-2]) + abs_t_rotations[c-1]
    }
    return abs_t_rotations
}

// num 2pi rotations of circle in single first child loop
function get_rotations(circles) {
    var rotations = [0]
    for (var c = 1; c < circles.length; c++) {
        const parent = circles[c-1]
        const child = circles[c]    
        const R = parent.radius
        const r = child.radius
        rotations[c] = (R - r)/r + rotations[c-1]
    }
    return rotations
}

// run ////////////////////////////////////


const stator_radius = 200

// inner = h, !inner = e
const circles = [
    { radius: stator_radius },
    { radius: 50 },
    { radius: 100 },
    { radius: 10 }
]

const pen_radius = 10


var theta_increment = Math.PI / 180

// big circle angle radians
var t_biggest = 0 

var rotations = get_rotations(circles)
var abs_t_rotations = get_abs_t_rotations(rotations)


// TODO change to be time based
function step() {
    
    let offset = {x: 0, y: 0}

    // draw stator
    draw_circle(offset.x, offset.y, circles[0].radius, "#ff26ff", "canvas-refreshing")

    for (var i = 1; i < circles.length; i++) {
        var parent_radius = circles[i-1].radius 
        var radius = circles[i].radius 
       
        var angle_around = abs_t_rotations[i] * t_biggest 
        var center_radius = parent_radius - radius 
        var center = get_point(center_radius, angle_around, offset)

        draw_circle(center.x, center.y, radius, "#ff26ff", "canvas-refreshing")
        
        var angle_rotated = 2 * Math.PI - rotations[i] * t_biggest 
        draw_line(angle_rotated, center, radius, "canvas-refreshing")
        
        offset = center
    } 
        
      
    // draw spirograph point and pen line
    var angle_rotated = 2 * Math.PI - rotations[i-1] * t_biggest 
    var spiro = get_point(pen_radius, angle_rotated, offset)
    draw_line(angle_rotated, offset, pen_radius, "canvas-refreshing")
    draw_point(spiro.x, spiro.y, "#ff2626", "canvas-static")

    //draw_point(pen.x, pen.y, "#ff26ff")
	t_biggest += theta_increment

    setTimeout(function () { clear_canvas("canvas-refreshing") } , 10)
    // stop drawing
    if (t_biggest < Math.PI * 8) {
        window.requestAnimationFrame(step);
    }
}


window.requestAnimationFrame(step);
