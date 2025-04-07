const PremiumMatter = require('../../model/premiumMatter');

class PremiumMatterController {

    // ✅ Fetch Premium Matter (First Record)
    getAllPremiumMatter = async (req, res) => {
        try {
            const userId = req.user; // Get user ID from request
            let matterList = await PremiumMatter.findOne();
            if (!matterList) {
                matterList = { matter: [] };
            }

            // Return data as JSON for API requests
      

            return res.render('admin/adminpremiummatter', { title: "Premium Matter", data: matterList, userId });
        } catch (error) {
res.redirect('/admin/premiumMatter/getall')
        }
    }

    // ✅ Create or Update Premium Matter
    createPremiumMatter = async (req, res) => {
        try {
            const { matter } = req.body;

            const updatedMatter = await PremiumMatter.findOneAndUpdate(
                {}, // Find the first document
                { matter }, // Update fields
                { new: true, upsert: true } // Return updated doc, create if missing
            );
res.redirect('/admin/premiumMatter/getall')
        } catch (error) {
        res.redirect('/admin/premiumMatter/getall')
        }
    }
}

module.exports = new PremiumMatterController();
