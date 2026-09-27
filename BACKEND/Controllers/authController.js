const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/UserModel");
const Doctor = require("../Models/DoctorManagement/doctorModel"); // Import Doctor model
const { resolveUserRole, USER_PORTAL_ROLES } = require("../lib/roles");
const { PENDING, REJECTED, getApprovalStatus } = require("../lib/doctorApproval");

// Register a User (Signup)
const registerUser = async (req, res) => {
  const { name, email, password, mobile, regDate, bloodGroup, country, city, gender, dateOfBirth } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      regDate,
      bloodGroup,
      country,
      city,
      gender,
      dateOfBirth,
      role: "patient",
    });

    await newUser.save();

    // Generate JWT Token
    const role = newUser.role || "patient";
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const u = { ...newUser };
    delete u.password;

    res.status(201).json({
      message: "User registered successfully",
      user: u,
      role,
      token: token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Please Fill All The Details" });
  }
};

// User Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email).toLowerCase().trim();

    const doctorAccount = await Doctor.findOne({ email: normalizedEmail });
    if (doctorAccount) {
      return res.status(403).json({
        message: "This email is registered as a doctor. Please use Doctor Login (/login-doctor).",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const role = resolveUserRole(user, normalizedEmail);
    if (!USER_PORTAL_ROLES.includes(role)) {
      return res.status(403).json({ message: "Account role is not allowed for patient/staff login." });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      role,
      token,
    });

  } catch (err) {
    console.error("loginUser:", err.message);
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({
        message: "Server misconfigured: JWT_SECRET is not set on the API host.",
      });
    }
    res.status(500).json({
      message: "Server Error",
      detail: process.env.VERCEL ? err.message : undefined,
    });
  }
};

// Register a Doctor (Signup)
const registerDoctor = async (req, res) => {
  const { name, email, password, phone, specialization, qualifications, experience, address, availability, gender, dateOfBirth, regDate } = req.body;

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    let existingDoctor = await Doctor.findOne({ email: normalizedEmail });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const newDoctor = new Doctor({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      specialization,
      qualifications,
      experience,
      address,
      availability,
      gender,
      dateOfBirth,
      regDate,
      approvalStatus: PENDING,
    });

    await newDoctor.save();

    res.status(201).json({
      message:
        "Registration submitted. A platform administrator will verify your credentials before you can sign in and appear to patients.",
      approvalStatus: PENDING,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Doctor Login
const loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(req.body);
    const normalizedEmail = String(email).toLowerCase().trim();

    const staffUser = await User.findOne({ email: normalizedEmail });
    if (staffUser) {
      const staffRole = resolveUserRole(staffUser, normalizedEmail);
      if (staffRole !== "patient") {
        return res.status(403).json({
          message: "This email is a staff account. Use the main login at /login.",
        });
      }
    }

    const doctor = await Doctor.findOne({ email: normalizedEmail });
    if (!doctor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const approval = getApprovalStatus(doctor);
    if (approval === PENDING) {
      return res.status(403).json({
        message:
          "Your registration is pending platform admin approval. You will be able to sign in after verification.",
        approvalStatus: PENDING,
      });
    }
    if (approval === REJECTED) {
      return res.status(403).json({
        message:
          doctor.rejectionReason ||
          doctor.rejection_reason ||
          "Your registration was not approved. Contact support if you believe this is an error.",
        approvalStatus: REJECTED,
      });
    }

    const token = jwt.sign(
      { id: doctor._id || doctor.id, email: doctor.email, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const safeDoctor = { ...doctor };
    delete safeDoctor.password;

    res.status(200).json({
      message: "Doctor login successful",
      doctor: safeDoctor,
      role: "doctor",
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Export Controllers
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.registerDoctor = registerDoctor;
exports.loginDoctor = loginDoctor;

