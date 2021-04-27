import React, { useState } from 'react';
import {
  UserExistError,
  UserNotFoundError,
  ValidationError,
} from './apis/error/user';
import { login, register } from './apis/lambda/user';

export function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof ValidationError) {
        alert(
          `${error.key} is not valid, expect ${error.expect}, but received ${error.received}`
        );
      }

      if (error instanceof UserNotFoundError) {
        alert('User does not exist or password is wrong');
      }
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
    } catch (error) {
      if (error instanceof UserExistError) {
        alert(
          'The e-mail has been registered, please change the e-mail and try again'
        );
      }
    }
  };

  return (
    <div className="bg-white font-family-karla h-screen">
      <div className="w-full flex flex-wrap">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
            <a
              href="https://midwayjs.org/"
              target="_blank"
              className="bg-black text-white font-bold text-xl p-4"
            >
              Midway Serverless 2.1
            </a>
          </div>
          <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
            <p className="text-center text-3xl">Welcome.</p>
            <div className="flex flex-col pt-3 md:pt-8">
              <div className="flex flex-col pt-4">
                <label htmlFor="email" className="text-lg">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex flex-col pt-4">
                <label htmlFor="password" className="text-lg">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex flex-row">
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-black border-black border-2 text-white font-bold text-lg hover:bg-gray-700 p-2 mt-8"
                >
                  Log In
                </button>

                <button
                  onClick={handleRegister}
                  className="flex-1 border-gray-900 border-2 text-black font-bold text-lg p-2 mt-8"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 shadow-2xl">
          <img
            className="object-cover w-full h-screen hidden md:block"
            src="https://images.unsplash.com/photo-1616578781650-cd818fa41e57?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218fHx8fHx8fHwxNjE2NjU3OTE1&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1600"
          />
        </div>
      </div>
    </div>
  );
}
