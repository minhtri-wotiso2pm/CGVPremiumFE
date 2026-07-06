import { type FC } from "react";
import AboutHero from "../components/about/AboutHero";
import BrandStorySection from "../components/about/BrandStorySection";
import StatsSection from "../components/about/StatsSection";
import ExperienceSection from "../components/about/ExperienceSection";
import TimelineSection from "../components/about/TimelineSection";
import TestimonialsSection from "../components/about/TestimonialsSection";
import CtaSection from "../components/about/CtaSection";
import "../about.css";

const AboutUsPage: FC = () => (
    <div className="abt-page">
        <AboutHero />
        <BrandStorySection />
        <StatsSection />
        <ExperienceSection />
        <TimelineSection />
        <TestimonialsSection />
        <CtaSection />
    </div>
);

export default AboutUsPage;
