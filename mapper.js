var fs = require('fs'),
    xml2object = require('xml2object');

// Create a new xml parser with an array of xml elements to look for
var parser = new xml2object([ 'data' ], 'channel_y.xml'),
    channels = fs.readFileSync('./channels.conf').toString().split('\n'),
    mappings = {};

channels.forEach(function (channel, index) {
    channels[index] = channel.split(';');
});

console.log(channels);

// Bind to the object event to work with the objects found in the XML file
parser.on('object', function(name, obj) {
    channels.forEach(function (channel) {
        if (channel[0].split(',')[0].match(new RegExp('^' + obj.ch0 + '$')) || channel[0].split(',')[0].match(new RegExp('^' + obj.ch0 + ' HD$'))) {
            if (mappings[obj.ch4]) {
            	mappings[obj.ch4].push(channel);
            } else {
                mappings[obj.ch4] = [channel];
            }
        }
    });
});

// Bind to the file end event to tell when the file is done being streamed
parser.on('end', function() {
    console.log('Finished parsing xml!');

    console.log(mappings);
});

// Start parsing the XML
parser.start();
