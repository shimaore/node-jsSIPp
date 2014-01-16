'use strict';
var JsSIP = require('jssip-for-node');
var Socket = require('ws')
  , connections = {};

var cnt;
var glbInterval;
var uriIP = 'XX.XX.XX.XX'; // Kindly change this appropriately
var uriPort = 'XXXX';
var clHold = 10000;
var caller;
var reciever;


// Get the session document that is used to generate the data.
//
var session = require(process.argv[2]);

//
// WebSocket connection details.
//
var masked = process.argv[4] === 'true'
  , binary = process.argv[5] === 'true'
  , protocol = +process.argv[3] || 13;



process.on('message', function message(task) {
  	var now = Date.now();

	//console.log(task.url+'  *****   '+task.messages+'  &&&&&&&&  '+task.id+'  ^^^^^^^ '+task.caller+'   %%%%    '+task.callee);
	caller = task.caller;
	reciever = task.callee;
	var configuration = {
		  'ws_servers': 'ws://'+uriIP+':'+uriPort,
		  'uri': 'sip:'+caller+'@'+uriIP+':'+uriPort,
		  'password': ''
		};
		
	var configuration1 = {
		  'ws_servers': 'ws://'+uriIP+':'+uriPort,
		  'uri': 'sip:'+reciever+'@'+uriIP+':'+uriPort,
		  'password': ''
		};

  	//
  	// Write a new message to the socket. The message should have a size of x
  	//
  	if ('write' in task) {
    		Object.keys(connections).forEach(function write(id) {
		      write(connections[id], task, id);
    		});
  	}
  

	var coolPhone = new JsSIP.UA(configuration);
    var coolPhone1 = new JsSIP.UA(configuration1);

	// Register callbacks to desired call events
	var eventHandlers = {
	  'progress':   function(e){ console.log('Progress');/* Your code here */ },
	  'failed':     function(e){ console.log("inside event failed     "+e.data.cause+"   "+e.data.originator+"   "+e.data.message);},
	  'started':    function(e){
		//alert ("inside event started ");
		var rtcSession = e.sender;
		console.log('Started   '+e.sender+"    "+rtcSession.direction);
		//alert("      "+rtcSession.direction);		    
	  },
	  'ended':      function(e){ console.log('Ended');/* Your code here */ }
	};
	
	var eventHandlers1 = {
	  'progress':   function(e){ console.log('Progress1');/* Your code here */ },
	  'failed':     function(e){ console.log("inside event failed1     "+e.data.cause+"   "+e.data.originator+"   "+e.data.message);},
	  'started':    function(e){
		//alert ("inside event started1 ");
		console.log('Started 1  '+e.sender+"   1   "+rtcSession.direction);
		var rtcSession = e.sender;
		//alert("   1   "+rtcSession.direction);
		/*
		// Attach local stream to selfView
		if (rtcSession.getLocalStreams().length > 0) {
		  selfView.src = JsSIP.global.URL.createObjectURL(rtcSession.getLocalStreams()[0]);
		}
	
		// Attach remote stream to remoteView
		if (rtcSession.getRemoteStreams().length > 0) {
		  remoteView.src = JsSIP.global.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
		}*/
	  },
	  'ended':      function(e){ console.log('Ended1');/* Your code here */ }
	};
	
	var options = {
	  'eventHandlers': eventHandlers,
	  'mediaConstraints': {'audio': false, 'video': false}
	};
	var options1 = {
	  'eventHandlers': eventHandlers1,
	  'mediaConstraints': {'audio': false, 'video': false}
	};

	
	coolPhone.start();
	console.log('COOL PHONE ASTATERD..');
	coolPhone1.start();
    // Make a call 
	//for(var i = 0; i < 60000; i++) {}
	/*var milliSeconds = 5000;
	var startTime = new Date().getTime(); // get the current time5.
    while (new Date().getTime() < startTime + milliSeconds); // hog cpu */
	var reg = false;
					
					coolPhone.on('connected', function(e)
					{
						var tport = e.data.transport;
						//alert(tport);
					});
					
					coolPhone1.on('newRTCSession', function(e)
					{
						var rtcSession = e.data.session;
						console.log(" Incoming call request "+rtcSession.direction);
						if (rtcSession.direction === 'incoming') {
							rtcSession.answer(options1);
							console.log(" Call Answered! ");
						}
					});
					
					coolPhone.on('registered', function(e)
					{
						var registered = e.data.response;
						console.log(" register request "+registered);
						reg = true;
					});
					coolPhone1.on('registered', function(e)
					{
						var registered = e.data.response;
						console.log(" register request1 "+registered);
						if (reg) {
							coolPhone.call('sip:'+reciever+'@'+uriIP+':'+uriPort, options);
						}
					});
					
					coolPhone.on('registrationFailed', function(e)
					{
						console.log(" register failed for caller  "+e.data.response);
						failedRegistrationCaller++;
					});
					
					coolPhone1.on('registrationFailed', function(e)
					{
						console.log(" register failed for callee   "+e.data.response);
						failedRegistrationCallee++;
					});

	//setTimeout(function(){coolPhone.call('sip:'+reciever+'@'+uriIP+':'+uriPort, options);}, 5000);
	
	//coolPhone.call('sip:'+reciever+'@'+uriIP+':'+uriPort, options);
	
	process.send({ type: 'open', duration: Date.now() - now, id: task.id });

	setTimeout(function(){coolPhone.unregister(options);}, clHold);
	setTimeout(function(){coolPhone.stop();}, clHold);
	setTimeout(function(){coolPhone1.unregister(options1);}, clHold);
	setTimeout(function(){coolPhone1.stop();}, clHold);     
	setTimeout(function(){process.send({type: 'close', id: task.id,read: 0,send: 0});}, clHold);


	if (task.shutdown) {
    		Object.keys(connections).forEach(function shutdown(id) {
      			connections[id].close();
    		});
  	}

  	// End of the line, we are gonna start generating new connections.
  	if (!task.url) return;

});
