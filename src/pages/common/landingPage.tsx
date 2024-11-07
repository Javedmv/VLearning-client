import React from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";

const LandingPage:React.FC = () => {
    return (
        <>
        <Carousel/>
        <CourseList/>
        <InstructorList/>
        </>
    )
}

export default LandingPage