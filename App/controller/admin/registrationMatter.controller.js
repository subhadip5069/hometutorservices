const RegistrationMatter = require('../../model/registrationMatter');

class RegistrationMatterController {
    // ✅ Fetch Registration Matter (First Record)
    getAllRegistrationMatter = async (req, res) => {
        try {
            const userId = req.user;

            let matterList = await RegistrationMatter.findOne();
            if (!matterList) {
                matterList = {
                    Studentmatter: [
                        { title: "Math Basics", description: "Introduction to algebra and geometry." }
                    ],
                    tutormatter: [
                        { title: "Advanced Math", description: "Calculus and differential equations." }
                    ]
                };
            }

          

            console.log(matterList);

            return res.render('admin/registrationmatter.ejs', {
                title: "Registration Matter",
                data: matterList,
                userId
            });
        } catch (error) {
            console.log("Error fetching registration matter:", error);
res.redirect('/admin/registration/getall')    
    }
    }

    // ✅ Create or Update Registration Matter for Students
    createStudentMatter = async (req, res) => {
        try {
            const { matter } = req.body; // Get student matters

            const updatedMatter = await RegistrationMatter.findOneAndUpdate(
                {}, // Find the first document
                { $set: { Studentmatter: matter } }, // Update only student matters
                { new: true, upsert: true }
            );

            res.redirect('/admin/registration/getall')    

        } catch (error) {
            res.redirect('/admin/registration/getall')    

        }
    }

    // ✅ Create or Update Registration Matter for Tutors
    createTutorMatter = async (req, res) => {
        try {
            const { matter } = req.body; // Get tutor matters

            const updatedMatter = await RegistrationMatter.findOneAndUpdate(
                {}, // Find the first document
                { $set: { tutormatter: matter } }, // Update only tutor matters
                { new: true, upsert: true }
            );

res.redirect('/admin/registration/getall')    
        } catch (error) {
res.redirect('/admin/registration/getall')    
        }
    }
}

module.exports = new RegistrationMatterController();
