import React from 'react';
import {
    SiHtml5, SiGithub, SiPython, SiNodedotjs,
    SiJavascript, SiMysql, SiTensorflow, SiReact, SiCss3
} from 'react-icons/si';
import QuestImg from '../assets/quest.png'
import './Allcss.css'

const Quest = () => {


    const logos = [
        [
            SiHtml5, SiGithub, SiPython
        ], [
            SiNodedotjs,
            SiJavascript, SiMysql
        ], [
            SiTensorflow, SiReact, SiCss3
        ]
    ]

    return (
        <div className="flex mt-20 items-start justify-around text-white font-sans overflow-hidden lg:overflow-none max-lg:flex-col max-lg:items-center max-lg:px-4">
            <div className='ml-[-2vw]flex flex-col max-lg:ml-0 max-lg:w-full'>
                <h1 className="text-3xl md:text-6xl leading-tight font-semibold text-white mb-30 max-lg:text-2xl max-sm:text-xl max-lg:text-center max-lg:mb-8">
                    Ignite Your Tech Journey with<br />
                    HackSprint <span className="text-white">Dev Quests</span>
                </h1>

                <div className="w-[55vw] h-full max-lg:w-full">
                    <img
                        src={QuestImg}
                        alt="DevQuest Preview"
                        className="w-full object-cover -mb-30 rounded-xl shadow-[0_0_10px_10px_rgba(0,255,255,0.2)] max-lg:mb-8"
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

            <div className="flex flex-col gap-10 mt-10 max-lg:gap-6 max-lg:mt-0 max-lg:w-full max-lg:items-center">
                <div className='flex flex-col gap-8 items-center ml-[-50px] max-lg:gap-4 max-lg:ml-0'>
                    {logos.map((items, index) => (
                        <div key={index} className='flex items-center gap-8 max-lg:gap-4'>
                            {items.map((Icon, i) => (
                                <Icon key={i} className="w-18 h-18 text-white max-lg:w-8 max-lg:h-8 max-sm:w-6 max-sm:h-6" />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-end text-xl md:text-[2rem] leading-snug mt-2 max-lg:items-center max-lg:text-center max-lg:text-lg max-sm:text-base">
                    <p>Join daily to enhance your skills</p>
                    <p>through <span className="font-bold">Quests</span> and <span className="font-bold">Coding</span></p>
                    <p><span className="">challenges.</span></p>
                </div>

                <div className='max-lg:w-full max-lg:flex max-lg:justify-center max-lg:px-8 max-lg:ml-11'>
                    <button className="w-full bgButton text-white mt-10 text-xl md:text-5xl py-7 rounded-3xl cursor-pointer max-lg:text-2xl max-sm:text-xl max-lg:py-4 max-lg:mt-6 max-lg:max-w-xs">
                        Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quest;