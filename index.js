const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const Home = require('./models/homes');
const WebSocket = require('ws');

// Create a WebSocket Server
global.wss = new WebSocket.Server({ port: 8080 });

const dataBack = {
  bedroom: {
    light: 0,
    ac: 0,
  },
};

// WebSocket Connection
wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(S) {
    try {
      let data = JSON.parse(S);
      console.log(data);

      if (data.arduino && data.update) {
        Home.findOne({ _id: data.homeId }, (err, homeObj) => {
          if (err) {
            ws.send(JSON.stringify({ error: 'Error fetching home' }));
            return console.error(err);
          }

          homeObj.rooms = data.rooms;
          homeObj.save((err) => {
            if (err) {
              ws.send(JSON.stringify({ error: 'Error updating home' }));
              return console.error(err);
            }
            console.log('Data has been updated');
            ws.send(JSON.stringify({ success: true }));
          });
        });

      } else if (data.updateMe) {
        Home.findById(data.homeId)
          .then((results) => {
            ws.send(JSON.stringify(results.rooms));
            console.log('Data sent to Arduino');
          })
          .catch((err) => {
            console.error(err);
            ws.send(JSON.stringify({ error: 'Error fetching data' }));
          });

      } else if (data.webSocket) {
        let roomId = data.rooms[0].id;
        let roomStatus = data.rooms[0].light;

        Home.updateOne({ 'rooms._id': roomId }, { '$set': { 'rooms.$.light': roomStatus } }, (err) => {
          if (err) {
            ws.send(JSON.stringify({ error: 'Error updating light status' }));
            return console.error(err);
          }
          console.log('Updated');
          ws.send(JSON.stringify({ success: true }));
        });
      }

    } catch (e) {
      console.error('Error processing message:', e);
      ws.send(JSON.stringify({ error: 'Invalid data format' }));
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: 'http://192.168.1.18:8081', credentials: true }));

// MONGODB CONNECTION
const dbURI = 'mongodb+srv://SoftswitchDev:%reset1821@softswitch-cluster.qh1t2.mongodb.net/SoftSwitch-db?retryWrites=true&w=majority';
const port = 3000;

mongoose.connect(encodeURI(dbURI), { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to DB');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error('DB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/homes', (req, res) => {
  const home = new Home({
    rooms: [
      { name: 'bedroom', lights: 0, ac: 1, gas: 22 },
      { name: 'kitchen', lights: 1, ac: 0, gas: 32 },
    ],
    users: [
      { name: 'Salma', email: 'salma@unnus.com', image: 'https://placeholder.com/cats/400x400' },
      { name: 'Julia', email: 'Julia@unnus.com', image: 'https://placeholder.com/dogs/400x400' },
    ],
  });

  home.save()
    .then((results) => res.send(results))
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: 'Error saving home' });
    });
});

app.post('/single-home', (req, res) => {
  Home.findById(req.body.id)
    .then((results) => {
      if (!results) {
        return res.status(404).send({ error: 'Home not found' });
      }
      res.send(results);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: 'Error fetching home' });
    });
});

app.post('/submit-home', (req, res) => {
  const home = new Home(req.body);

  home.save()
    .then((results) => res.send(results))
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: 'Error saving home' });
    });
});

app.get('/all-homes', (req, res) => {
  Home.find()
    .then((results) => res.send(results))
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: 'Error fetching homes' });
    });
});

// const express = require('express')
// const app = express()
// const cors = require('cors')
// const mongoose = require('mongoose');
// const Home = require('./models/homes');
// const WebSocket = require('ws');
// const router = express.Router();


// global.wss = new WebSocket.Server({port:8080});

// const dataBack = {
//   bedroom:{
//     light:0,
//     ac:0
//   }
// }


// wss.on('connection', function connection(ws){
//   console.log('client logged');
  
//   ws.on('message', function incoming(S){

//     console.log(S)
//     let data = JSON.parse(S);
//     console.log(data);
//     console.log(data.rooms.room1);
//     console.log(data.rooms.room2);

//     // if(data.arduino && data.update){
//     //   console.log('data coming from arduino so, heres the updates for this id:' + data.homeId);

//     //   Home.findOne({_id:data.homeId}, (err, homeObj) => {
//     //     homeObj.rooms = data.rooms
//     //     homeObj.save();
//     //     console.log('data has been updated')
//     //   });

//     // }else if(data.updateMe){
//     //   Home.findById(data.homeId) 
//     //     .then((results) => {
//     //       ws.send(JSON.stringify(results.rooms));
//     //       console.log('data sent to arduino');
//     //     })
//     //     .catch((err) => {console.log(err)})

//     // }else if(data.webSocket){
//     //   console.log('data is coming from websocket so update only lights', data.rooms)  
//     //   let roomId = data.rooms[0].id;
//     //   let roomStatus = data.rooms[0].light;
//     //   Home.updateOne({'rooms._id': roomId}, {'$set': {
//     //     'rooms.$.light': roomStatus,
//     //   }}, function(err) { 
//     //   console.log('updated');
//     // });    

//     // }else if(data.webSocketUpdateMe){
//     //   console.log('request comming from websocket that asks for update so give it to them')

//     //   Home.findById(data.homeId) 
//     //     .then((results) => {
//     //       ws.send(JSON.stringify(results.rooms));
//     //       console.log('data sent');
//     //     })
//     //     .catch((err) => {console.log(err)})
//     // }
//     // update database from the value S

//     // ws.send(JSON.stringify(dataBack))
//   })
// })

// // Middlewares 

// app.use(express.urlencoded({extended:true}));
// // app.use(express.bodyParser());

// app.use(express.json());

// app.use('/auth', require('./login/auth'));


// // MONGODB CONNECTION
// const dbURI = 'mongodb+srv://SoftswitchDev:%reset1821@softswitch-cluster.qh1t2.mongodb.net/SoftSwitch-db?retryWrites=true&w=majority';

// const port = 3000

// mongoose.connect(encodeURI(dbURI), {useNewUrlParser:true, useNewUrlParser:true, useUnifiedTopology: true })
//   .then((result)=> {
//     console.log('connected to DB')
   
//       app.listen(port, () => {
//         console.log(`Example app listening at http://localhost:${port}`)
//       })
//   }).catch((err) => console.log(err));


// app.use(cors({ origin: 'http://192.168.1.18:8081', credentials: true }));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })      

// app.get('/homes', (req, res) => {

//   const home = new Home({
//     rooms:[{
//       name:'bedroom',
//       lights:0,
//       ac:1,
//       gas:22
//     },{
//       name:'kitchen',
//       lights:1,
//       ac:0,
//       gas:32
//     }
//   ],
//     users:[{
//       name:'Salma',
//       email:'salma@unnus.com',
//       image:'https://placeholder.com/cats/400x400'
//     },
//     {
//       name:'Julia',
//       email:'Julia@unnus.com',
//       image:'https://placeholder.com/dogs/400x400'
//     }
//   ]
//   });

//   home.save()
//       .then((results) => {
//         res.send(results)
//       })
//       .catch((err) => {
//         console.log(err);
//       });
// });      

// app.get('/all-homes', (req, res) => {
  
//   Home.find()
//   .then((results) => {
//     res.send(results);
//   })
//   .catch((err) => {console.log(err)})

// });      

// app.post('/single-home', (req, res) => {
//   console.log(req.body);

//   Home.findById(req.body.id) 
//   .then((results) => {
//     res.send(results);
//   })
//   .catch((err) => {console.log(err)})

// });      

// app.post('/submit-home', (req,res) => {

//   const home = new Home(req.body);

//   home.save()
//       .then((results) => {
//         res.send(results)
//         console.log('data has been sent')
//       })
//       .catch((err) => {
//         console.log(err);
//       });
// });      

// app.get('/all-homes', (req, res) => {
  
//   Home.find()
//   .then((results) => {
//     res.send(results);
//   })
//   .catch((err) => {console.log(err)})


//   res.send("The home's name is a home")
//   console.log(req.body);
// })




