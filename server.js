const fs = require("fs");
const express=require("express");
const app=express();
const path=require('path');

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// Simple session-like middleware using cookies
app.use((req, res, next) => {
    // Parse cookies manually
    const cookies = {};
    if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
        });
    }
    req.cookies = cookies;
    
    // Check if user cookie exists
    if (req.cookies.user) {
        try {
            const user = JSON.parse(decodeURIComponent(req.cookies.user));
            res.locals.user = user;
        } catch (e) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    
    // Handle flash messages from session cookie
    if (req.cookies.flash) {
        try {
            const flash = JSON.parse(decodeURIComponent(req.cookies.flash));
            res.locals.error = flash.error || null;
            res.locals.success = flash.success || null;
            res.clearCookie('flash');
        } catch (e) {
            res.locals.error = null;
            res.locals.success = null;
        }
    } else {
        res.locals.error = null;
        res.locals.success = null;
    }
    
    next();
});


app.get('/',function(req,res){
    res.render("index",{title:"HOME"});
})


app.get('/apply-complaint',function(req,res){
    res.render("apply-complaint",{title:"APPLY COMPLAINT"});
})

app.get('/previous-complaints',function(req,res){
    const complaints = JSON.parse(fs.readFileSync('./complaints.json', 'utf8'));
    
    // Filter complaints for the current user
    let userComplaints = [];
    if (req.cookies.user) {
        try {
            const user = JSON.parse(decodeURIComponent(req.cookies.user));
            userComplaints = complaints.filter(complaint => complaint.user.id === user.id);
        } catch (e) {
            // If cookie is invalid, show empty list
            userComplaints = [];
        }
    }
    
    res.render("previous-complaints",{title:"PREVIOUS COMPLAINTS", complaints: userComplaints});
})

app.get('/about',function(req,res){
    res.render("about",{title:"ABOUT"});
})

app.get("/signin", (req, res) => {
    res.render("signin");
});

// Debug route
app.get("/debug", (req, res) => {
    res.json({
        cookies: req.cookies,
        locals_user: res.locals.user,
        headers_cookie: req.headers.cookie
    });
});

// User Registration (Sign Up)
app.post("/signup", (req, res) => {
    const { full_name, email, password } = req.body;
    
    // Read existing users
    const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        // Set flash error message and redirect back to signin
        res.cookie('flash', JSON.stringify({error: 'User already exists with this email'}), { 
            maxAge: 5000,
            httpOnly: false 
        });
        return res.redirect('/signin');
    }
    
    // Add new user
    const newUser = {
        id: Date.now().toString(),
        full_name,
        email,
        password, // In production, you should hash this password
        created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    
    // Set user cookie
    res.cookie('user', JSON.stringify(newUser), { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours 
        httpOnly: false 
    });
    
    res.redirect('/');
});

// User Login (Sign In)
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    
    // Read users
    const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('User found, setting cookie:', user.full_name);
        // Set user cookie
        res.cookie('user', JSON.stringify(user), { 
            maxAge: 24 * 60 * 60 * 1000, // 24 hours 
            httpOnly: false 
        });
        res.redirect('/');
    } else {
        // Set flash error message and redirect back to signin
        res.cookie('flash', JSON.stringify({error: 'Invalid email or password'}), { 
            maxAge: 5000,
            httpOnly: false 
        });
        res.redirect('/signin');
    }
});

// Logout
app.get("/logout", (req, res) => {
    // Clear user cookie
    res.clearCookie('user');
    res.redirect('/');
});

// Complaint Submission
app.post("/submit-complaint", (req, res) => {
    
    // Check if user is logged in
    if (!req.cookies.user) {
        res.cookie('flash', JSON.stringify({error: 'Please login to submit a complaint'}), { 
            maxAge: 5000, // 5 seconds
            httpOnly: false 
        });
        return res.redirect('/apply-complaint');
    }
    
    console.log('User cookie found, proceeding with complaint submission');
    let user;
    try {
        user = JSON.parse(decodeURIComponent(req.cookies.user));
    } catch (e) {
        res.cookie('flash', JSON.stringify({error: 'Invalid session. Please login again.'}), { 
            maxAge: 5000,
            httpOnly: false 
        });
        return res.redirect('/apply-complaint');
    }
    
    const { studentName, roomNumber, category, priority, description, contactNumber } = req.body;
    
    // Read existing complaints
    const complaints = JSON.parse(fs.readFileSync('./complaints.json', 'utf8'));
    
    // Add new complaint with user details
    const newComplaint = {
        id: Date.now().toString(),
        studentName,
        roomNumber,
        category,
        priority,
        description,
        contactNumber,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email
        },
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    complaints.push(newComplaint);
    fs.writeFileSync('./complaints.json', JSON.stringify(complaints, null, 2));
    
    // Set success flash message
    res.cookie('flash', JSON.stringify({success: 'Complaint submitted successfully!'}), { 
        maxAge: 5000,
        httpOnly: false 
    });
    res.redirect('/previous-complaints');
});



app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
