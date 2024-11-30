import React, { useEffect, useState } from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const LandingPage:React.FC = () => {
    const user = useSelector((state:RootState) => state.user);
    const [users, setUsers] = useState({})
    console.log(user, 'user in landing page')
    useEffect(() => {
        setUsers(() => {
            user
        })
    },[user])

    console.log(users)
    return (
        <>
        <Navbar/>
        <Carousel navigationType="dots"/>
        <CourseList/>
        <Carousel navigationType="arrows"/>
        <InstructorList/>
        <Footer/>
        </>
    )
}

export default LandingPage