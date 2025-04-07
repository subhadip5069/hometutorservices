const RazorpayPayment = require('../../model/payment.model');
const PurchasePlan = require('../../model/purchaceplane');
const Registration = require('../../model/registration');
const User = require('../../model/user.model');
const userModel = require('../../model/user.model');
const Marquee = require('../../model/marquee');

class AdminPagesController {

    Login=async(req,res)=>{
        const message = req.session.message;
        req.session.message = null;
            res.render('Admin/login',{
                title:"/ Login",
                message
            })
       
    }


  

    

    Dashboard = async (req, res) => {
        try {
            const userId = req.user;
    
            // Fetch total counts
            const [
                totalUsers,
                totalStudents,
                totalTeachers,
                totalRequirements,
                activeStudents,
                inactiveStudents,
                activeTutors,
                inactiveTutors,
            ] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: "student" }),
                User.countDocuments({ role: "tutor" }),
                Registration.countDocuments(), // Total requirements
                User.countDocuments({ role: "student", status: "active" }),  // Active students
                User.countDocuments({ role: "student", status: "inactive" }), // Inactive students
                  // Active tutors
                User.countDocuments({ role: "tutor", status: "inactive" })  // Inactive tutors
            ]);
    
            // Fetch total student & tutor requirements using `populate`
            const registrations = await Registration.find({ userId: { $exists: true } }).populate("userId");
    
            // Filter student and tutor requirements based on user role
            const totalStudentRequirements = registrations.filter(reg => reg.userId?.role === "student").length;
            const activeTutorRequirements = registrations.filter(reg => reg.userId?.role === "tutor" && reg.status === "active").length;
            const inactiveTutorRequirements = registrations.filter(reg => reg.userId?.role === "tutor" && reg.status === "inactive").length;
    
            // Fetch total payments correctly
            const totalPayments = await RazorpayPayment.aggregate([
                { $match: { paymentStatus: "successful" } }, // Only count successful payments
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]);
    
            // Ensure totalAmount is a number
            const totalAmount = totalPayments.length > 0 ? totalPayments[0].totalAmount : 0;
    
            res.render('Admin/dashboard', {
                userId,
                totalUsers,
                totalStudents,
                totalTeachers,
                totalRequirements,
                totalPayments: totalAmount / 100,
                activeStudents,
                inactiveStudents,
                activeTutors,
                inactiveTutors,
                totalStudentRequirements,
                activeTutorRequirements,
                inactiveTutorRequirements
            });
        } catch (error) {
            console.error("Error loading dashboard:", error);
            res.redirect('/admin/');
        }
    };
    
    
    
    
    
    // API Route for Payment Data (to be called via AJAX)
 getPaymentStats = async (req, res) => {
        try {
            const payments = await RazorpayPayment.aggregate([
                { $match: { paymentStatus: "successful" } }, // Only successful payments
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                {
                    $lookup: {
                        from: "purchaseplans",
                        localField: "planId",
                        foreignField: "_id",
                        as: "plan",
                    },
                },
                { $unwind: "$user" },
                { $unwind: "$plan" },
                {
                    $group: {
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 },
                        users: { $push: "$user.name" }, // List of users
                        plans: { $push: "$plan.name" }, // List of plans
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]);
    
            const formattedData = payments.map((p) => ({
                year: p._id.year,
                month: p._id.month,
                totalAmount: p.totalAmount / 100, // Convert paise to INR
                count: p.count,
                users: p.users,
                plans: p.plans,
            }));
    
            res.json({ success: true, data: formattedData });
        } catch (error) {
            console.error("Error fetching payment stats:", error);
            res.status(500).json({ success: false, error: "hello world" });
        }
    };
    
    // Export Routes

    
    listofStudents=async(req,res)=>{
            const userId = req.user;
        const users = await userModel.find({role:'student'}).lean();
       
        res.render('Admin/listOfStudents' ,{users,userId})
       
    }
    listOfTutor=async(req,res)=>{
            const userId = req.user;
        const users = await User.find({role:'tutor'}).lean();
       
        res.render('Admin/listOfTutor' ,{users ,userId})
       
    }
    document = async (req, res) => {
        try{
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        if (page < 1) page = 1;

        let skip = (page - 1) * limit;

        const totalRegistrations = await Registration.countDocuments({
            status: "inactive",
            attachedFiles: { $exists: true, $not: { $size: 0 } }
        });

        const totalPages = Math.ceil(totalRegistrations / limit);

        if (page > totalPages && totalPages !== 0) {
            return res.redirect(`?page=${totalPages}`);
        }

        const registrations = await Registration.find({
            status: "inactive",
            attachedFiles: { $exists: true, $not: { $size: 0 } }
        })
            .populate("userId", "name email randomId ")
            .select("userId tuitionLocation subject attachedFiles documentVerificationStatus class about")
            .skip(skip)
            .limit(limit)
            .lean();

        res.render("Admin/documentVerification", {
            title: "Inactive Registrations with Documents",
            registrations,
            currentPage: page,
            totalPages
        });

    } catch (err) {
        console.error("Error fetching registrations:", err);
        res.status(500).send("hello world");
    }
    };

    

    
    allstudentsrequirment = async (req, res) => {
        try {
            const userId = req.user;
            let page = parseInt(req.query.page) || 1;
            let limit = 6;
            if (page < 1) page = 1;
    
            let skip = (page - 1) * limit;
            let searchQuery = req.query.query ? req.query.query.trim() : "";
    
            // Base filter: Fetch students WITHOUT documents
            let filter = {
                status: "active",

                attachedFiles: { $exists: true, $size: 0 }
            };
    
            // If there's a search query, modify the filter
            if (searchQuery) {
                filter.$or = [
                    { "userId.name": { $regex: searchQuery, $options: "i" } }, // Case-insensitive name
                    { "userId.email": { $regex: searchQuery, $options: "i" } }, // Email
                    { "userId.phone": { $regex: searchQuery, $options: "i" } }, // Phone number
                    { "userId.randomId": { $regex: searchQuery, $options: "i" } }, // Random ID
                    { tuitionLocation: { $regex: searchQuery, $options: "i" } }, // Tuition Location
                    { preferredTime: { $regex: searchQuery, $options: "i" } }, // Preferred Time
                    { preferredTutor: { $regex: searchQuery, $options: "i" } }, // Preferred Tutor
                    { subject: { $regex: searchQuery, $options: "i" } }, // Subject
                    { class: { $regex: searchQuery, $options: "i" } }, // Class
                    { board: { $regex: searchQuery, $options: "i" } } // Board
                ];
            }
    
            // Count total matching results
            const totalRegistrations = await Registration.countDocuments(filter);
            const totalPages = Math.ceil(totalRegistrations / limit);
    
            if (page > totalPages && totalPages !== 0) {
                return res.redirect(`?page=${totalPages}`);
            }
    
            // Fetch student registrations based on the filter
            const registrations = await Registration.find(filter)
                .populate({
                    path: "userId",
                    match: { role: "student" }, // Ensure only students are fetched
                    select: "name email randomId role phone"
                })
                .select("userId tuitionLocation preferredTime preferredTutor feeType feeAmount state city pincode locality subject class sorted board qualification experience age createdAt updatedAt status")
                .skip(skip)
                .limit(limit)
                .lean();
    
            // Remove registrations where userId is missing
            const filteredRegistrations = registrations.filter(reg => reg.userId);
    
            // Fetch all students (for debugging)
            const students = await Registration.find().populate("userId");
    
            res.render("Admin/allstudentrequirment", {
                title: "Student Registrations Without Documents",
                registrations: filteredRegistrations,
                students: students,
                currentPage: page,
                totalPages,
                userId
            });
    
        } catch (err) {
            console.error("Error fetching student registrations:", err);
            res.redirect("/admin/allstudentrequirment");
        }
    };
    
    updateUserContactRemaining = async (req, res) => {
        try {
            const id = req.params.id;
            const additionalUnlocks = parseInt(req.body.additionalUnlocks, 10);
    
            if (isNaN(additionalUnlocks) || additionalUnlocks <= 0) {
                req.session.message = { type: "error", text: "Please enter a valid positive number." };
                return res.redirect("/admin/alltutorrequirment");
            }
    
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { $inc: { unlockedContactsRemaining: additionalUnlocks } }, // Increment unlocks
                { new: true }
            );
    
            if (!updatedUser) {
                req.session.message = { type: "error", text: "User not found. Please try again." };
                return res.redirect("/admin/alltutorrequirment");
            }
    
            req.session.message = { type: "success", text: `Added ${additionalUnlocks} unlocks successfully!` };
            return res.redirect("/admin/alltutorrequirment");
    
        } catch (error) {
            console.error("Error updating unlocks:", error);
            req.session.message = { type: "error", text: "Something went wrong. Please try again." };
            return res.redirect("/admin/alltutorrequirment");
        }
    };
    
    
    
    
    adminupdatedtuition = async (req, res) => {
        try{
            const userId = req.user.userId;
            const id = req.params.id;
        //   if current status active then change to inactive
        // if current status inactive then not change to active 

            const status = req.body.status;
            const updatedRegistration = await Registration.findByIdAndUpdate(id, { status }, { new: true });
            if (!updatedRegistration) {
                req.session.message = { type: "error", text: "Something went wrong. Please try again." };
                return res.redirect("/admin/allstudentrequirment");
            }
             req.session.message = { type: "error", text: "Thank you for your response." };
             return res.redirect("/admin/allstudentrequirment");
        } catch (error) {
             req.session.message = { type: "error", text: "Something went wrong. Please try again." };
             return res.redirect("/admin/allstudentrequirment");

        }
    }
           
            
    alltutorrequirment = async (req, res) => {
        try {
            const userId = req.user;
            let page = parseInt(req.query.page) || 1;
            let limit = 10;
            if (page < 1) page = 1;
    
            let searchQuery = req.query.query ? req.query.query.trim().toLowerCase() : "";
    
            let skip = (page - 1) * limit;
    
            // Base filter for active registrations with attached files
            let filter = {
                status: "active",
                attachedFiles: { $exists: true, $not: { $size: 0 } }
            };
    
            // Apply tutor filter directly in query for efficiency
            let registrations = await Registration.find(filter)
                .populate({
                    path: "userId",
                    select: "name email randomId role phone status unlockedContactsRemaining",
                })
                .lean();
    
            // Remove registrations where userId is null or not a tutor
            let filteredRegistrations = registrations.filter(reg => reg.userId?.role === "tutor");
    
            // Apply search filtering efficiently
            if (searchQuery) {
                filteredRegistrations = filteredRegistrations.filter(reg => {
                    const user = reg.userId || {}; // Ensure userId exists
                    return [
                        user.email, user.name, user.phone, user.randomId, 
                        reg.tuitionLocation, reg.preferredTime, 
                        reg.preferredTutor, reg.subject, reg.class, reg.board
                    ]
                    .some(field => String(field || "").toLowerCase().includes(searchQuery));
                });
            }
    
            // Count total pages before slicing
            const totalRegistrations = filteredRegistrations.length;
            const totalPages = Math.ceil(totalRegistrations / limit) || 1;
    
            // Redirect if requested page is greater than available pages
            if (page > totalPages && totalPages > 0) {
                return res.redirect(`?page=${totalPages}`);
            }
    
            // Apply pagination AFTER filtering
            const paginatedRegistrations = filteredRegistrations.slice(skip, skip + limit);
    
            res.render("Admin/alltutorrequirment", {
                title: "Tutor Registrations with Documents",
                registrations: paginatedRegistrations,
                currentPage: page,
                totalPages,
                userId
            });
    
        } catch (err) {
            console.error("Error fetching tutor registrations:", err);
            res.redirect("/admin/alltutorrequirment");
        }
    };
    
    
    
   

    payments=async(req,res)=>{
        const userId = req.user;
        const payments = await RazorpayPayment.find()
        .populate("userId", "name email")
        .populate("planId", "planName")
        .sort({ createdAt: -1 })  // Ensure planId is populated
        .lean();
        res.render('Admin/payments',{
            title:'Payments',
            userId,
            payments
        })
    }

    createPrimium=async(req,res)=>{
        const userId = req.user;
        res.render('Admin/createpurchaseplane',{
            title:'Create Purchase Plan',
            userId
        })
    }
    getpurchaseplan = async (req, res) => {
        try {
            const userId = req.user;
            const plans = await PurchasePlan.find().lean();

          
            res.render("Admin/getpurchaceplane", {
                title: "Purchase Plan",
                plans,
               // Ensure CSRF middleware is enabled
                userId
            });
        } catch (error) {
            console.error("Error fetching purchase plans:", error);
            
        }
    };

    marquee = async (req, res) => {
        try {
            const userId = req.user;
            const marquee = await Marquee.findOne(); // Get only one marquee instead of all
    
            res.render("Admin/marquee", {
                title: "Marquee",
                marquee,
                userId
            });
        } catch (error) {
            console.error("Error fetching marquee:", error);
            res.redirect("/admin/marquee?error=Error fetching marquee");
        }
    };
    
   
}

module.exports = new AdminPagesController();
