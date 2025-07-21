import React from 'react';
import {
  SiHtml5, SiGithub, SiPython, SiNodedotjs,
  SiJavascript, SiMysql, SiTensorflow, SiReact, SiCss3
} from 'react-icons/si';
import QuestImg from '../assets/quest.png';
import './Allcss.css';

const Quest = () => {
  const logos = [
    [SiHtml5, SiGithub, SiPython],
    [SiNodedotjs, SiJavascript, SiMysql],
    [SiTensorflow, SiReact, SiCss3]
  ];

  return (
    <div className="bg-[#060A21] text-white font-sans flex w-full min-h-screen">
      <div className="flex flex-col lg:flex-row lg:min-w-[1000px] h-full w-full">

        
        <div className="w-full lg:w-[60%] flex flex-col pt-8 sm:pt-12 md:pt-14 lg:pt-16 xl:pt-20 px-4 sm:px-6 md:px-8 lg:ml-12 xl:ml-16 lg:px-0 justify-between">
          <div className="pr-0 lg:pr-6 xl:pr-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight font-bold text-white w-full text-center lg:text-left">
              Ignite Your Tech Journey with<br />
              HackSprint <span className="text-white">Dev Quests</span>
            </h1>
          </div>

          <div className="pr-0 lg:pr-6 xl:pr-8 mt-8 sm:mt-12 md:mt-14 lg:mt-16 xl:mt-20 flex-1 flex flex-col justify-end">
            <img
              src={QuestImg}
              alt="DevQuest Preview"
              className="w-full h-auto object-cover rounded-xl"
              style={{
                boxShadow: `
                  0px 0px 1.15px rgba(25, 87, 84, 1),
                  0px 0px 2.29px rgba(25, 87, 84, 1),
                  0px 0px 8.03px rgba(25, 87, 84, 1),
                  0px 0px 16.06px rgba(25, 87, 84, 1),
                  0px 0px 27.53px rgba(25, 87, 84, 1),
                  0px 0px 48.18px rgba(25, 87, 84, 1)
                `
              }}
            />
          </div>
        </div>

        
        <div className="w-full lg:w-[40%] flex flex-col px-4 sm:px-6 lg:px-4 xl:px-6 h-full justify-between items-center py-6 lg:py-0">

          <div className="flex flex-col justify-center items-center pt-4 sm:pt-6 md:pt-8 lg:pt-8 md:pt-12 xl:pt-16">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5">
              {logos.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                  {row.map((Icon, iconIndex) => (
                    <Icon
                      key={iconIndex}
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 2xl:w-18 2xl:h-18 text-white hover:text-gray-300 transition-colors duration-300"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center py-4 sm:py-5 md:py-6 lg:py-4 md:py-6 xl:py-8">
            <div className="text-center space-y-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xs xl:max-w-md 2xl:max-w-lg px-2 lg:px-0">
              <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-2xl 2xl:text-3xl text-white leading-tight font-medium">
                Join daily to enhance your skills
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-2xl 2xl:text-3xl text-white leading-tight font-medium lg:ml-10 md:ml-12">
                through <span className="font-bold text-white">Quests</span> and <span className="font-bold text-white">Coding</span>
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-2xl 2xl:text-3xl text-white leading-tight font-medium lg:ml-10 md:ml-70">
                <span className="font-semibold">challenges.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start pt-4 sm:pt-6 md:pt-8 lg:pt-6 xl:pt-10 mb-6 sm:mb-8 md:mb-10 lg:mb-8 xl:mb-12 2xl:mb-16">
            <button 
              className="bgButton text-white font-bold text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl py-2 sm:py-3 md:py-3 lg:py-2 xl:py-3 2xl:py-4 3xl:py-5 px-6 sm:px-8 md:px-10 lg:px-6 xl:px-8 2xl:px-12 3xl:px-16 rounded-2xl transition-all duration-300 transform hover:scale-105 w-48 sm:w-56 md:w-64 lg:w-64 xl:w-80 2xl:w-96"
              style={{ 
                height: '80px',
                marginLeft: 'calc(-5cm + 5cm)'
              }}
            >
              Question
            </button>
          </div>
          </div>

        </div>
      </div>
      );
};

      export default Quest;