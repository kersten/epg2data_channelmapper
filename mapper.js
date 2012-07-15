var fs = require('fs'),
    xml2object = require('xml2object');

// Create a new xml parser with an array of xml elements to look for
var parser = new xml2object([ 'data' ], 'channel_y.xml'),
    channels = fs.readFileSync('./channels.conf').toString().split('\n'),
    hdChannels = {};
    mapChannels = [],
    mappings = {};

channels.forEach(function (channel, index) {
    var tmp = channel.split(";"),
        name = tmp.shift();
    
    channels[index] = [name, tmp.join(';')];
});

// Bind to the object event to work with the objects found in the XML file
parser.on('object', function(name, obj) {
    if (obj.ch0.match(/\sHD/)) {
        hdChannels[obj.ch0.replace(/\sHD/, "")] = true;
    }
    
    mapChannels.push(obj);
});

// Bind to the file end event to tell when the file is done being streamed
parser.on('end', function() {
    mapChannels.forEach(function (obj) {
        if (hdChannels[obj.ch0] === undefined && !obj.ch0.match(/\sHD/)) {
            mapChannels.push({
                ch0: obj.ch0 + " HD",
                ch4: obj.ch4
            });
        }
    });
    
    mapChannels.forEach(function (obj) {
        channels.forEach(function (channel) {
            if (channel[0].split(',')[0].match(new RegExp('^' + obj.ch0 + '$'))) {
                /* SIGNALQUELLE-NID-TID-SID */
                /* Name	Frequenz	Parameter	Signalquelle	Symbolrate	VPID	APID	TPID	CAID	SID	NID	TID	RID */
                channelObj = channel[1].split(":");
                
                if (mappings[obj.ch4]) {
                    mappings[obj.ch4].channels.push(channelObj[3] + "-" + channelObj[10] + "-" + channelObj[11] + "-" + channelObj[9]);
                } else {
                    mappings[obj.ch4] = {
                        name: obj.ch0,
                        obj: obj,
                        channels: [channelObj[3] + "-" + channelObj[10] + "-" + channelObj[11] + "-" + channelObj[9]]
                    }
                }
            }
        });
    });
    
    for (var key in mappings) {
        // 694 = S19.2E-1-1017-61303,S19.2E-1-1107-17504,S19.2E-133-5-776
        console.log(key + " = " + mappings[key].channels.join(","));
    }

    //console.log(require("util").inspect(mappings,true,null));
});

// Start parsing the XML
parser.start();
