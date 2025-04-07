const Step = require('../../model/homepageinstruction');

class StepController {
  // ✅ GET both student and tutor steps
  getSteps = async (req, res) => {
    try {
      let stepDoc = await Step.findOne().lean();

      if (!stepDoc) {
        // fallback if no document found
        stepDoc = {
          userTypestudent: [{ icon: '', text: '', role: 'student' }],
          userTypetutor: [{ icon: '', text: '', role: 'tutor' }]
        };
      }

      res.render('admin/AdminInstruction', {
        title: "Manage Steps",
        studentSteps: stepDoc.userTypestudent,
        tutorSteps: stepDoc.userTypetutor
      });

    } catch (error) {
      console.error('Error fetching steps:', error);
      res.redirect('/admin/steps');
    }
  };

  // ✅ POST: update both student and tutor steps
  updateSteps = async (req, res) => {
    try {
      const { studentSteps, tutorSteps } = req.body;

      const formattedStudent = studentSteps.map(s => ({ ...s, role: 'student' }));
      const formattedTutor = tutorSteps.map(t => ({ ...t, role: 'tutor' }));

      await Step.findOneAndUpdate(
        {},
        {
          $set: {
            userTypestudent: formattedStudent,
            userTypetutor: formattedTutor
          }
        },
        { upsert: true }
      );

      res.redirect('/admin/steps');

    } catch (error) {
      console.error('Error updating steps:', error);
      res.redirect('/admin/steps');
    }
  };
}

module.exports = new StepController();
