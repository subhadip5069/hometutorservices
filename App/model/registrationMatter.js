const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registrationMatterSchema = new Schema({
  Studentmatter: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      role : { type: String,default: "student" },
      
    }
  ],
   tutormatter: [
        {
        title: { type: String, required: true },
        description: { type: String, required: true },
        role : { type: String,default: "tutor" },
        }
    ],
  
}, { timestamps: true });

const RegistrationMatter = mongoose.model('RegistrationMatter', registrationMatterSchema);
module.exports = RegistrationMatter;
