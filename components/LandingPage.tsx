import React from 'react';
import Hero from './Hero';
import FeaturedCourses from './FeaturedCourses';
import Categories from './Categories';
import Testimonials from './Testimonials';
import CourseIdeaGenerator from './CourseIdeaGenerator';
import StatsBar from './StatsBar';

const LandingPage: React.FC = () => {
  return (
    <>
      <Hero />
      <FeaturedCourses />
      <Categories />
      <StatsBar />
      <Testimonials />
      <CourseIdeaGenerator />
    </>
  );
};

export default LandingPage;
