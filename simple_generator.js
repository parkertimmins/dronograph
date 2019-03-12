
function rotations_to_complete(circles) {
    

}


const to_radians = degree => degree * Math.PI / 180;

function add_altitude(lat_long_point, altitude) {
	return {
		latitude: lat_long_point.latitude,
		longitude: lat_long_point.longitude,
		altitude: altitude 
	}
}

function csv_template(waypoints) {
	const format_line = waypoint => `${waypoint.latitude},${waypoint.longitude},${waypoint.altitude}`
	const waypoints_str = waypoints.map(format_line).join("\n")
	return "latitude,longitude,height\n" + waypoints_str;
}

function kml_template(waypoints) {
	const format_line = waypoint => `${waypoint.longitude},${waypoint.latitude},${waypoint.altitude}`
	const waypoints_str = waypoints.map(format_line).join("\n")
	return `<?xml version="1.0" encoding="UTF-8"?>
		<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
		<Document>
		<Placemark>
				<LineString>
                    <altitudeMode>relativeToGround</altitudeMode>
					<tessellate>0</tessellate>
					<coordinates>${waypoints_str}</coordinates>
				</LineString>
			</Placemark>
		</Document>
		</kml>
	`
}

function convert_to_lat_long(point, lat_origin_degree, long_origin_degree, meters_per_unit) {
    const x_meters = meters_per_unit * point.x;
    const y_meters = meters_per_unit * point.y;
    
    const METER_PER_LAT_DEGREE = 111321;

    const y_lat_degree = lat_origin_degree + y_meters / METER_PER_LAT_DEGREE 
    const y_lat_radians = y_lat_degree * Math.PI / 180
    const meter_per_long_degree = Math.cos(y_lat_radians) * METER_PER_LAT_DEGREE 
    const x_long_degree = long_origin_degree + x_meters / meter_per_long_degree

    return {
        latitude: y_lat_degree,
        longitude: x_long_degree,
    }
}



function furthest_point_from_center(circles, pen_radius) {
    let furthest = 0;
    for (var c = 1; c < circles.length; c++) {
        const parent = circles[c-1];
        const circle = circles[c];
    
        // this case is weird and overestimates if there is ever a child circle
        if (circle.inner && circle.radius > parent.radius) {
            furthest -= parent.radius
            furthest += circle.radius
        }  else {
            furthest += parent.radius;
            furthest += (circle.inner ? -circle.radius : circle.radius);
        }
    }

    furthest += pen_radius;
    return furthest;
}

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
	return { right, down }
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
  	ctx.strokeStyle = color
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
function get_revolutions_amount(rotations) {
    var revolutions = [0, 1]
    for (var c = 2; c < rotations.length; c++) {
        revolutions[c] = (rotations[c-1] - rotations[c-2]) + revolutions[c-1]
    }
    return revolutions
}

// num 2pi rotations of circle in single first child loop
function get_rotations_amount(circles) {
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
    const directions = [0]; 
    directions[1] = circles[1].inner ? CW : CCW
    for (var c = 2; c < circles.length; c++) {
        directions[c] = circles[c].inner ? same(directions[c-1]) : opposite(directions[c-1])
    }
    return directions 
}

function get_revolve_directions(circles, rotate_directions) {
    const directions = [0]; 
    for (var c = 1; c < circles.length; c++) {
        directions[c] = circles[c].inner ? opposite(rotate_directions[c]) : same(rotate_directions[c])
    }
    return directions 
}

function get_single_point_settings(angle_biggest_rotor, circles, pen_radius, rotations, revolutions) {

    const circle_settings = [];
    let offset = {x: 0, y: 0};

    for (let i = 1; i < circles.length; i++) {
        const parent = circles[i-1];
        const circle = circles[i];
       
        const angle_around = revolutions[i] * angle_biggest_rotor;
        const center_radius = circle.inner ? parent.radius - circle.radius : parent.radius + circle.radius;
        const center = get_point(center_radius, angle_around, offset);
        const angle_rotated = rotations[i] * angle_biggest_rotor;
        circle_settings.push({ center, angle_rotated });

        offset = center;
    } 
        
    const last_circle_angle_rotated = circle_settings[circle_settings.length-1].angle_rotated
    const spiro_point = get_point(pen_radius, last_circle_angle_rotated, offset);

    return { spiro_point, circle_settings };
}


function get_sample_points(inputs, input_rotations) {
    
    const angle_diff_degrees = inputs.end_segment_degrees - inputs.start_segment_degrees;
    const angle_diff_radians = to_radians(angle_diff_degrees);
    const start_angle_radians = to_radians(inputs.start_segment_degrees);

    const angle_increment = angle_diff_radians / (inputs.num_sample_points - 1);
    
    const point_samples = [];
    for (let i = 0; i < inputs.num_sample_points; i++) {
        const angle_biggest_rotor = i * angle_increment + start_angle_radians;
        const sample = get_single_point_settings(angle_biggest_rotor, inputs.circles, inputs.pen_radius, input_rotations.rotations, input_rotations.revolutions);
        point_samples.push(sample);
    }

    return point_samples;
}

function get_input_rotations(circles) {
    const rotate_amounts = get_rotations_amount(circles);
    const rotate_directions = get_rotate_directions(circles);
    const rotations = circles.map((e, i) => rotate_amounts[i] * rotate_directions[i])
    
    const revolve_amounts = get_revolutions_amount(rotate_amounts);
    const revolve_directions = get_revolve_directions(circles, rotate_directions);
    const revolutions = circles.map((e, i) => revolve_amounts[i] * revolve_directions[i])
    
    return { rotations, revolutions };
}

function get_draw_inputs() {
    const stator_radius = parseInt(document.getElementById("stator-radius").value);
    const rotor_lines = document.getElementById("radius-input").value
        .split("\n").filter(line => line.length > 0);
   
    let circles = [ {radius: stator_radius} ];
    circles = circles.concat(rotor_lines.map(split_circle_line));

    const pen_radius = parseInt(document.getElementById("pen-radius").value)

    const num_sample_points = parseInt(document.getElementById("sample-points").value);
    const start_segment_degrees = parseFloat(document.getElementById("start-segment").value);
    const end_segment_degrees = parseFloat(document.getElementById("end-segment").value);

    return {
        circles,
        pen_radius,
        num_sample_points,
        start_segment_degrees,
        end_segment_degrees
    } 
}

function validate_lat_long(input) {
    const error_msg = "Latitude, Longitude input must be two comma separated value decimal numbers between -180 and 180"

    if (input === null) {
        return { error: error_msg };
    }

    const parts = input.split(/,| /)
    if (parts.length !== 2) {
        return { error: error_msg };
    }

    const lat = parseFloat(parts[0]);
    const long = parseFloat(parts[1]);
   
    // NaN will fail 
    if (lat < -180 || lat > 180 || long < -180 || long > 180) {
        return { error: error_msg };
    }

    return { value: { latitude: lat, longitude: long } };
}


////////////////////////////// run ////////////////////////////////////




////// global values for step function /////


let inputs = null; 
let input_rotations = null; 
let point_samples = null; 
let current_point = 0;


function step() {
  
    const point_sample = point_samples[current_point];
  
    // draw all circles 
    draw_state_at_point(inputs.circles, inputs.pen_radius, point_sample);

    // draw point 
    const spiro = point_sample.spiro_point;
    draw_point(spiro.x, spiro.y, "#0000ff", "canvas-static")
    
    // draw line between last
    if (current_point >= 1) {
        const last_point_sample = point_samples[current_point-1];
        draw_2_point_line(point_sample.spiro_point, last_point_sample.spiro_point, "#ff2626", "canvas-static")
    } 

    setTimeout(function () { clear_canvas("canvas-refreshing") } , 10)

    // stop drawing
    if (current_point < point_samples.length - 1) {
        current_point += 1;
        window.requestAnimationFrame(step);
    } else {
        current_point = 0;
    }
    
    
    /* 
    else {
        draw_2_point_line(points[points.length-1], points[0],  "#ff2626", "canvas-static")

        let meters_radius = parseInt(document.getElementById("scale-radius").value);
        
        let lat_long = validate_lat_long(document.getElementById("center-lat-long").value).value;
        
        let meters_per_unit = meters_radius / points[0].x;

		const waypoints = points.map(point => {
			let point_lat_long = convert_to_lat_long(point, lat_long.latitude, lat_long.longitude, meters_per_unit);
			let waypoint = add_altitude(point_lat_long, 50); 
			return waypoint
		});

        // wrap back to beginning
        waypoints.push(waypoints[0]);
        
        var kml = kml_template(waypoints);
        var csv = csv_template(waypoints);

		download('path_' + waypoints.length + ".kml", kml);

    } 
    */
}

function draw_state_at_point(circles, pen_radius, point_sample) {

    // draw stator
    draw_circle(0, 0, circles[0].radius, "#000000", "canvas-refreshing")
  
    // draw rotors 
    for (let i = 1; i < circles.length; i++) {
        const parent_radius = circles[i-1].radius;
        const radius = circles[i].radius;
        const settings = point_sample.circle_settings[i - 1]; // for this circle ... has no value for stator
        
        draw_circle(settings.center.x, settings.center.y, radius, "#000000", "canvas-refreshing")
        draw_line(settings.angle_rotated, settings.center, radius, "canvas-refreshing")
    } 
        
    // draw pen
    const last_circle_settings = point_sample.circle_settings[point_sample.circle_settings.length - 1];
    draw_line(last_circle_settings.angle_rotated, last_circle_settings.center, pen_radius, "canvas-refreshing")
}

function drawCompletely() {
    clear_canvas("canvas-refreshing")
    clear_canvas("canvas-static")

    inputs = get_draw_inputs();
    input_rotations = get_input_rotations(inputs.circles);
    point_samples = get_sample_points(inputs, input_rotations);

    point_samples.forEach((point_sample, i) => {
        // draw point 
        const spiro = point_sample.spiro_point;
        draw_point(spiro.x, spiro.y, "#0000ff", "canvas-static")
        
        // draw line between last
        if (i >= 1) {
            const last_point_sample = point_samples[i-1];
            draw_2_point_line(point_sample.spiro_point, last_point_sample.spiro_point, "#ff2626", "canvas-static")
        } 
    });
}


function startAnimation() {
    clear_canvas("canvas-refreshing")
    clear_canvas("canvas-static")

    inputs = get_draw_inputs();
    input_rotations = get_input_rotations(inputs.circles);
    point_samples = get_sample_points(inputs, input_rotations);

    console.log(point_samples.length);

    window.requestAnimationFrame(step);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}



// on load code  ////////////////////////////////////////////////
window.onload = function () {
       document.getElementById("start-animation").onclick=startAnimation;
       document.getElementById("draw-completely").onclick=drawCompletely;
}

