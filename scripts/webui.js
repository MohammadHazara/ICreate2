// ROSLIBJS Documentation:
// http://robotwebtools.org/jsdoc/roslibjs/current/Ros.html

var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;


function moveAction(linear, angular) {
    if (linear !== undefined && angular !== undefined) {
        twist.linear.x = linear;
        twist.angular.z = angular;
    } else {
        twist.linear.x = 0;
        twist.angular.z = 0;
    }
    console.log("Moving : ");
    cmdVel.publish(twist);
}



function initVelocityPublisher() {
    // Init message with zero values.
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: 'turtle1/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();
}

// to create keyboard controller object
function initTeleopKeyboard() {
    // Use w, s, a, d keys to drive your robot

    // Check if keyboard controller was aready created
    if (teleop == null) {
        // Initialize the teleop.
        teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: 'turtle1/cmd_vel'
        });
    }

    // Add event listener for slider moves
    robotSpeedRange = document.getElementById("robot-speed");
    robotSpeedRange.oninput = function () {
        teleop.scale = robotSpeedRange.value
    }
}

function updateSpeedText() {
    $("#speed-text").text($("#robot-speed").val());
}

function createJoystick() {
    // Check if joystick was aready created
    if (manager == null) {
        joystickContainer = document.getElementById('joystick');
        // joystck configuration, if you want to adjust joystick, refer to:
        // https://yoannmoinet.github.io/nipplejs/
        var options = {
            zone: joystickContainer,
            position: { left: 50 + '%', top: 105 + 'px' },
            mode: 'static',
            size: 200,
            color: '#0066ff',
            restJoystick: true
        };
        manager = nipplejs.create(options);
        // event listener for joystick move
        manager.on('move', function (evt, nipple) {
            // nipplejs returns direction is screen coordiantes
            // we need to rotate it, that dragging towards screen top will move robot forward
            var direction = nipple.angle.degree - 90;
            if (direction > 180) {
                direction = -(450 - nipple.angle.degree);
            }
            // convert angles to radians and scale linear and angular speed
            // adjust if youwant robot to drvie faster or slower
            var lin = Math.cos(direction / 57.29) * nipple.distance * 0.005;
            var ang = Math.sin(direction / 57.29) * nipple.distance * 0.05;
            // nipplejs is triggering events when joystic moves each pixel
            // we need delay between consecutive messege publications to 
            // prevent system from being flooded by messages
            // events triggered earlier than 50ms after last publication will be dropped 
            if (publishImmidiately) {
                publishImmidiately = false;
                moveAction(lin, ang);
                setTimeout(function () {
                    publishImmidiately = true;
                }, 50);
            }
        });
        // event litener for joystick release, always send stop message
        manager.on('end', function () {
            moveAction(0, 0);
        });
    }
}

function toggleContent(id) {
    $("#" + id).toggle();
}

function changeTopic() {
    var topic = $("#ROS_TOPIC_TEXTBOX").val();
    console.log(topic);
    if (!topic.endsWith("/cmd_vel")) {
        topic += "/cmd_vel";
    }

    console.log(topic);

    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: topic,
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();
}

function changeRosIp() {
    ros.close();
    var newIp = $("#ROS_IP_TEXTBOX").val();
    robot_IP = newIp;
    ros.url = "ws://" + robot_IP + ":9090";
    console.log(ros.url);
    ros.connect(ros.url);
    $("#master_ip").text(robot_IP);
}


window.onload = function () {
    updateSpeedText();
    // determine robot address automatically
    //robot_IP = location.hostname;
    robot_IP = "192.168.0.10";
    $("#master_ip").text(robot_IP);

    // set robot address statically
    // robot_IP = "10.5.10.117";
    console.log(robot_IP);
    // // Init handle for rosbridge_websocket
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });


    initVelocityPublisher();
    createJoystick();
    initTeleopKeyboard();
    // get handle for video placeholder
    video = document.getElementById('video');
    // Populate video source 
    video.src = "http://" + robot_IP + ":8080/stream?topic=/camera/rgb/image_raw&type=mjpeg&quality=80";
    video.onload = function () {
        // joystick and keyboard controls will be available only when video is correctly loaded
        //createJoystick();
        //initTeleopKeyboard();
    };

    ros.on('connection', function () {
        $("#ConnectionMessage").text("Successfully connected!");
        console.log('Connected to websocket server.');
    });

    ros.on('error', function (error) {
        $("#ConnectionMessage").text("Failed to connect");
        console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function () {
        console.log('Connection to websocket server closed.');
    });
}