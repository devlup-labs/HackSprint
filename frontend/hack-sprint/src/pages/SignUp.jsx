import "../index.css";
import { Link , useNavigate} from "react-router-dom";
import { useState } from "react";

function SignUp() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
    
    if (!name || !email || !password) {
    alert("Please fill all fields");
    return;

  }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center gap-1 bg-[rgb(6,10,33)] px-2 py-8">
        <p
          style={{
            
            fontFamily: "techbit",
            color: "#19B03F",
            fontSize: "102px",
          }}
        >
          HACKSPRINT
        </p>

        <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-6 rounded-2xl shadow-xl w-full max-w-md flex items-center flex-col gap-1 border-1 border-green-500">
          <div className="text-[#FFFCDE] text-3xl font-semibold">
            <h3>Signup</h3>
          </div>

          <div className="text-sm text-[#FFFFFF]">
            <h6>Start your journey!</h6>
          </div>

          <div className="w-full my-5">
            <div className="relative my-3">
              <img
                src="/person.png"
                alt="person"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                value={name}
                onChange={(e)=>{setName(e.target.value)}}
                className="bg-[#7B8BAB66] rounded-[2rem] w-full text-[#FFFFFF] placeholder-white px-10 py-2 cursor-pointer"
                placeholder="Full Name"
                type="text"
              />
            </div>
            <div className="relative my-3">
              <img
                src="/Mail.png"
                alt="email"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                value={email}
                onChange={(e)=>{setEmail(e.target.value)}}
                className="bg-[#7B8BAB66] rounded-[2rem] w-full text-[#FFFFFF] placeholder-white px-10 py-2 cursor-pointer"
                placeholder="Email Id"
                type="text"
              />
            </div>
            <div className="relative my-3">
              <img
                src="/Lock.png"
                alt="person"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                value={password}
                onChange={(e)=>{setPassword(e.target.value)}}
                className="bg-[#7B8BAB66] rounded-[2rem] w-full text-[#FFFFFF] placeholder-white px-10 py-2 cursor-pointer"
                placeholder="Password"
                type="text"
              />
            </div>
          </div>


          <div className="bg-[#058DA2] w-full rounded-4xl flex items-center justify-center py-2">
            <button 
            onClick={handleSubmit}
            className="text-white font-semibold cursor-pointer">
              Signup
            </button>
          </div>


          <div className="text-white text-sm flex gap-2 py-1 items-start justify-start w-full px-1">
            <p>Already have an account?</p>
            <Link
              to="/login"
              className="underline hover:text-indigo-300 transition duration-200"
            >
              Login
            </Link>
          </div>

          <div className="w-full">
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="mx-2 text-gray-300">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>
          </div>
           
           <div className="w-full">
             <button
          // onClick={googleLogin}
          className="w-full flex items-center justify-center gap-2 border border-[#535353CC] py-2 rounded-2xl bg-white"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Login with Google
        </button>

        <button
          // onClick={githubAuthLogin}
          className="w-full mt-2 flex items-center justify-center gap-2 border border-[#535353CC] py-2 rounded-2xl bg-white"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
            alt="Github"
            className="w-5 h-5"
          />
          Login with Github
        </button>
           </div>

        </div>
      </div>
    </>
  );
}

export default SignUp;
