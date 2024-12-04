import React, { useEffect } from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const LandingPage:React.FC = () => {
    const {user} = useSelector((state:RootState) => state.user);
    // const [myUser, SetMyUser] = useState({})

    console.log(user, 'user in landing page')
    
    useEffect(() => {
        
    },[])

    // console.log(,"abother variable for user")
    return (
        <>
        <Navbar User={user}/>
        <Carousel navigationType="dots"/>
        <CourseList/>
        <Carousel navigationType="arrows"/>
        <InstructorList/>
        <Footer/>
        </>
    )
}

export default LandingPage