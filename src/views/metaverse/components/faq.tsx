const faqs = [
    {
        id: 1,
        ques: 'What is Yuku Metaverse?',
        answer: `Yuku Metaverse is a blockchain-based virtual platform that provides
        high-resolution immersive experiences of collaboration, communication and
        connection. Yuku empowers people and companies to imagine, create and own
        assets in the metaverse. `,
    },
    {
        id: 2,
        ques: 'What can I do in the Yuku Metaverse?',
        answer: `In the expansive realm of the Yuku Metaverse, possibilities abound 
        across multiple domains. You can curate immersive exhibitions showcasing art, 
        fashion, and historical artifacts while engaging in diverse events, from 
        concerts to conferences, fostering interactive experiences. Dive into Web3 
        projects, sparking innovation through AMAs, hackathons, and roadshows, and 
        elevate brand interactions using 3D avatars in virtual shops. Establish 
        exclusive spaces for leaders, followers, and live streaming, fostering 
        intimate virtual environments. Immerse yourself in the entertainment and 
        gaming industry, and utilize the platform for educational pursuits like 
        lectures and seminars, facilitating knowledge dissemination. Extend your 
        reach to NGOs and the public sector, collaborating and initiating public 
        service endeavors within this expansive digital landscape.`,
    },
    {
        id: 3,
        ques: 'How can I build something in the Yuku Metaverse?',
        answer: `In the evolving landscape of the Yuku Metaverse, opportunities abound 
        for creators of various backgrounds to actively contribute. As a Metaverse-as-a-Service 
        provider, Yuku invites architects, artists, Web3 innovators, brands, Key Opinion 
        Leaders (KOLs), and more to collaboratively shape this forthcoming iteration of 
        the 3D Internet. Recognized for its potential to generate significant economic 
        value, the Metaverse economy is poised to make a substantial impact. 
        If you're an architect envisioning immersive spaces, an artist seeking to craft 
        virtual experiences, a Web3 pioneer aiming to innovate, or a brand looking to 
        enhance engagement, Yuku offers a platform for collaborative construction. 
        Reach out to us at <a style="color: #0a8aff" href='mailto:contact@yuku.app'>contact@yuku.app</a> 
        to join hands in building this expansive digital realm together.`,
    },
    // {
    //     id: 4,
    //     ques: 'What is the Yuku token model?',
    //     answer: `Yuku Metaverse is a blockchain-based virtual platform that provides
    //     high-resolution immersive experiences of collaboration, communication and
    //     connection. Yuku empowers people and companies to imagine, create and own
    //     assets in the metaverse. Yuku is developed by the Yuku Foundation, the
    //     first and only Swiss metaverse foundation.`,
    // },
    // {
    //     id: 5,
    //     ques: 'How do I get Yuku tokens?',
    //     answer: `Yuku Metaverse is a blockchain-based virtual platform that provides
    //     high-resolution immersive experiences of collaboration, communication and
    //     connection. Yuku empowers people and companies to imagine, create and own
    //     assets in the metaverse. Yuku is developed by the Yuku Foundation, the
    //     first and only Swiss metaverse foundation.`,
    // },
];

export default function HomeFAQ() {
    return (
        <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
            <div className="mt-[60px] w-full text-center font-['Inter'] text-[32px] font-semibold leading-tight text-white md:mt-[190px] md:text-[64px]">
                FAQ
            </div>

            <div className="mx-auto mt-[10px] flex max-w-[960px] flex-col">
                {faqs.map((item, index) => {
                    return (
                        <div
                            key={item.id}
                            data-aos="fade-up"
                            data-aos-duration="600"
                            data-aos-delay={100 * index}
                        >
                            <div
                                className="
                                ques-animation mt-[20px] flex !max-h-[60px] w-full cursor-pointer flex-col 
                                rounded-[34px] px-[25px] py-[20px]
                                hover:!max-h-[390px] sm:!max-h-[76px] sm:px-[38px] sm:py-[27px] 
                                md:mt-[50px] md:hover:!max-h-[290px]
                            "
                            >
                                <p className="text-md font-inter-semibold font-semibold leading-[100%] text-white sm:text-xl">
                                    {item.id}. {item.ques}
                                </p>
                                <p
                                    className="mt-[23px] font-inter text-base font-normal leading-normal text-white text-opacity-70"
                                    dangerouslySetInnerHTML={{ __html: item.answer }}
                                >
                                    {/* {item.answer} */}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
