XX13: Pace-Breaker
============

Backstory
------------------------------------
The year is XX13, and robots rule... Humankind has been forced to live in hiding, 
hunted by the cybernetic law enforcement agents. Just when all seems lost a group 
of resistance members infiltrate the robot city, hiding in plain sight in a crowd
of civilian cybernetics and deactivating as many as possible. The agents must 
find and eliminate these rebels by listening out for tell-tale heartbeats...

How to play
------------------------------------
The hacker team needs to avoid being seen while hacking as many civilian robots
as possible. The police need to find and stop them as soon as possible!

Move around using the arrow keys and interact with the nearest robot using the
SPACE, CTRL, SHIFT or ENTER keys. Police interactions destroy the target robot 
instantly, while hacker interactions implant a slow-release but equally deadly
virus.

To connect to the server
------------------------------------
All you need to do is connect to '<host ip address>:1986' in your browser, 
where '<host ip address>' is the
server's ip address. You can figure this out using 'ipconfig' or 'ifconfig'. To
connect to a server running on your own machine you can use 'localhost' instead
of an ip. We recommend Chrome, but the client should run on Firefox too. 

To run the server
------------------------------------
Running the client is simple (you just need a browser), but to run the server 
you'll need the Node.js interpretor (download it free from: http://nodejs.org/) 
as well as
the 'mime' and 'socket.io' packages installed for the server to work:

1. Open a terminal (in Windows run 'cmd')

2. Place yourself in the game's directory (using 'cd')

3. Run 'npm install mime' to install the mime package

4. Run 'npm install socket.io' to install the socket.io package

5. Run 'nodejs src/server.node.js' (or 'node src/server.node.js' depending on the version of Node)


