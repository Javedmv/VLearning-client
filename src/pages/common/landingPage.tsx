import React from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

const LandingPage:React.FC = () => {
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