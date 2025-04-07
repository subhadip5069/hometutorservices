const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const premiumMatterSchema = new Schema({
    matter: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true }
        }
    ]
}, { timestamps: true });

const PremiumMatter = mongoose.model('PremiumMatter', premiumMatterSchema);
module.exports = PremiumMatter;