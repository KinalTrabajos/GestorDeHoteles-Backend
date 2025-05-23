import User from '../users/user.model.js';
import { hash, verify } from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';

export const login = async(req, res) => {

    try {

        const user = req.user; 
        const token = await generarJWT(user.id);

        return res.status(200).json({
            msg: 'Login successful',
            userDetails: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                token: token,
                role: user.role,
            }
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
}

export const register = async (req, res) => {
    try {
        const data = req.body; 

        const encryptedPassword = await hash(data.password);

        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email.trim(), 
            password: encryptedPassword
        })

        return res.status(201).json({
            message: "User registered successfully",
            userDetails: {
                user: user.email
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "The user cannot log in",
            error: error.message
        })
    }
}



const createHotelAdmin = async ( name, surname, username, email, password, role ) => {
    try {

        if (role === "HOTEL_ADMIN") {
            const existAdmin = await User.findOne({ role: "HOTEL_ADMIN" });
            if (existAdmin) {
                console.log("--------------------------- Error -------------------------------")
                console.log("A user with admin role already exists. Another cannot be created.");
                console.log("-----------------------------------------------------------------")
                return null;
            };
        };

    const encryptedPassword = await hash(password);

    const newUser = new User({ 
        name, 
        surname, 
        username, 
        email, 
        password: encryptedPassword, 
        role });

        await newUser.save();
        console.log("User created successfully:", newUser);
        return newUser;
        
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

createHotelAdmin("Kevin", "Reyes", "kreyes","kreyes@gmail.com", "12345678", "HOTEL_ADMIN");

const createPlataformAdmin = async ( name, surname, username, email, password, role ) => {
    try {

        if (role === "PLATAFORM_ADMIN") {
            const existAdmin = await User.findOne({ role: "PLATAFORM_ADMIN" });
            if (existAdmin) {
                console.log("--------------------------- Error -------------------------------")
                console.log("A user with admin role already exists. Another cannot be created.");
                console.log("-----------------------------------------------------------------")
                return null;
            };
        };

    const encryptedPassword = await hash(password);

    const newUser = new User({ 
        name, 
        surname, 
        username, 
        email, 
        password: encryptedPassword, 
        role });

        await newUser.save();
        console.log("User created successfully:", newUser);
        return newUser;
        
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}

createPlataformAdmin("Jeremy", "Arevalo", "jarevalo","jarevalo@gmail.com", "12345678", "PLATAFORM_ADMIN");

