import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginContext from '../contexts/LoginContext';
import { FormInput, FormHeader } from './Login';

const Register = () => {
  const { setState, setIsLogin, setRole, setUserId } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    setState('login');
  }, [setState]);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const buttonRef = useRef(null);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleButtonClick = async (e) => {
    e.preventDefault();
    buttonRef.current.classList.add('loading');
    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();
    let hasError = false; // Flag to track if there are any errors

    if (!name) {
      setNameError('Please enter your name');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!email) {
      setEmailError('Please enter your email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      hasError = true;
    } else if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      hasError = true;
    } else if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      hasError = true;
    } else if (!/(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain at least one digit');
      hasError = true;
    } else if (!/(?=.*[^\da-zA-Z])/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      buttonRef.current.classList.remove('loading');
      return; // Stop registration process if there are errors
    }

    try {
      // Proceed with registration
      const res = await fetch(
        'https://guided-backend-1.onrender.com/api/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
          credentials: 'include',
        }
      );

      const data = await res.json();
      buttonRef.current.classList.remove('loading');

      if (res.status === 201) {
        alert('User registered successfully');
        setIsLogin(true);
        setRole('user');
        setUserId(data._id);
        navigate('/channels');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  }

  return (
    <div className="hero min-h-screen bg-primary text-neutral p-1 py-16">
      <div className="max-w-xl">
        <FormHeader title="Register for a new account" description="User Register Page" />
        <div className="card max-w-sm shadow-2xl bg-base-100 p-4 md:p-8 gap-4 mx-auto">
          <div className="form-control">
            <label>Name</label>
            <input type="text" placeholder="Elon Musk" ref={nameRef} />
            <div className="text-error">{nameError}</div>
          </div>
          <div className="form-control">
            <label>Email</label>
            <input type="email" placeholder="Email" ref={emailRef} />
            <div className="text-error">{emailError}</div>
          </div>
          <div className="form-control">
            <label>Password</label>
            <input type="password" placeholder="Password" ref={passwordRef} />
            <div className="text-error">{passwordError}</div>
          </div>

          <div className="form-control mt-6">
            <button className="btn btn-secondary" ref={buttonRef} onClick={handleButtonClick}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Register;
