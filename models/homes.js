const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type:String,
        required:true,
    },
    light: {
        type:Number,
    },
    ac:{
        type:Number,
    },
    gas:{
        type:Number,
    }, 
    temp:{
        type:Number,
    },        
    voltage:{
        type:Number,
    },     
    amps:{
        type:Number,
    },     
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
      }
    
});

const userSchema = new Schema({
    name:{
        type: String,
        required:true,
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },    
    phone: {
        type:String,
        required:true,
    },
    image:{
        type: String,
        required: true
    }
});

const homeSchema = new Schema({
    rooms: {
        type:[roomSchema],
        required:true,
        },
    users:{
        type:[userSchema],
        required:true
    },
});



const Home = mongoose.model('Home', homeSchema);

module.exports = Home;