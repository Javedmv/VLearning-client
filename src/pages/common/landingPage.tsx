import React, { useEffect, useState } from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { commonRequest ,URL } from "../../common/api";
import { config } from "../../common/configurations";
import { Banner } from "../../types/Banner";

const LandingPage:React.FC = () => {
    const {user} = useSelector((state:RootState) => state.user);
    const [highPriorityBanner, setHighPriorityBanner] = useState<Banner[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);

    // const [myUser, SetMyUser] = useState({})
    // console.log(user, 'user in landing page')
    const fetchBanners = async () => {
        try {
            const response = await commonRequest("GET",`${URL}/auth/get-all-active-banner`,{},config);
            setHighPriorityBanner(response.highPriority as Banner[]);
            setBanners([...response.mediumPriority as Banner[], ...response.lowPriority as Banner[]]);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        }
    }
    
    useEffect(() => {
        fetchBanners();
    },[])

    // console.log(,"abother variable for user")
    return (
        <>
        <Navbar User={user}/>
        {
            highPriorityBanner.length > 0 && <Carousel banner={highPriorityBanner} navigationType="dots"/>
        }
        
        <CourseList/>
        {
            banners.length > 0 && <Carousel banner={banners} navigationType="arrows"/>
        }
        <InstructorList/>
        <Footer/>
        </>
    )
}

export default LandingPage