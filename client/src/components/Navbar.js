import React from 'react';
import { Link } from 'react-router-dom'; // If using React Router
import './Navbar.css'; // Import CSS for styling
import logo from './animal-hospitality-logo.png'

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                {/* Replace with your actual logo component or image */}
                <img src={logo} alt="Animal Hospitality Logo" />
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/">Home</Link>
                </li>
                {/* <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/services">Services</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li> */}
                {/* Add more links as needed (e.g., Login, Register) */}
                <li>
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/register">Register</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;