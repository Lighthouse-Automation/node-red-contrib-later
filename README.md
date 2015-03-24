# node-red-contrib-later
A node red node for triggering using [later.js](http://bunkat.github.io/later/index.html).

##Installation
```bash
$npm install node-red-contrib-later
```
##Usage

  This node accepts either a `msg.payload` as a string or as an object. In all cases the schedule string in the node schedule string property is used if set.

  If the schedule fails to parse `node.warn()` is called with details of the string and error as reported by the parser, and the `msg.payload` is sent on immediately.

  If the schedule is empty, the `msg.payload` is passed straight through.

  To cancel a running schedule pass in a message with an empty payload with the `msg.later` property from a previously sent sceduled message.

###Payload as string

  In the case the payload is a string the node will try and parse it through `later.parse.text()`.

###Payload as an object

  If the payload is an object the property `msg.payload.later` is used as the schedule string.

##Examples
  See the [documentation of later.parse.text()](http://bunkat.github.io/later/parsers.html#text) for the format of the schedule string.

  `every 10 seconds` or `at 10:15 am` are simple examples.

###Example flow file

  Try pasting in the flow file below that sends the payload every 10th second twice.

  ```json
  [{"id":"b9995d6c.4666a","type":"later","name":"The schedule","schedule":"every 10 seconds","x":384,"y":129,"z":"80e3898c.7f1c78","wires":[["b8f9cfce.47063","4a71efdd.b58e1"]]},{"id":"b9335ee3.46cca","type":"inject","name":"","topic":"","payload":"comes out later","payloadType":"string","repeat":"","crontab":"","once":true,"x":124,"y":130,"z":"80e3898c.7f1c78","wires":[["b9995d6c.4666a"]]},{"id":"b8f9cfce.47063","type":"debug","name":"","active":true,"console":"false","complete":"true","x":620,"y":129,"z":"80e3898c.7f1c78","wires":[]},{"id":"4a71efdd.b58e1","type":"function","name":"Run schedule 2 times","func":"if (msg.later.count >= 2) {\n    delete msg.payload; \n    return msg;\n} else {\n    return;\n}\n","outputs":1,"valid":true,"x":382,"y":248,"z":"80e3898c.7f1c78","wires":[["b9995d6c.4666a"]]}]
  ```

##Author

  - Dean Sellers

##License

The MIT License (MIT)

Copyright (c) 2015 Lighthouse Automation &lt;dean@lighthouseautomation.com.au&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
