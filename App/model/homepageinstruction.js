// models/Step.js
const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({


  userTypestudent:[{
    role : { type: String,default: "student" },
    icon: String,
    text: String
    }],
    userTypetutor:[{
    role : { type: String,default: "tutor" },
    icon: String,
    text: String
    }],
 
});

module.exports = mongoose.model('Step', stepSchema);
