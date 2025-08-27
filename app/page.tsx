import type { Metadata } from "next";
import BlogSection from "./components/home/blog";
import HeroSection from "./components/home/hero";
import ProjectsSection from "./components/home/projects";
import Footer from "./components/nav/Footer";

export const metadata: Metadata = {
  title: "Ognjen Adzic - Portfolio",
  description:
    "Currently working on PennyOne, Pingless, and a few ideas still under the surface.",
};

export default function Home() {
  return (
    <>
      <main className="font-sans">
        <HeroSection subtitle="I value clarity, efficiency, and making things that people actually want to use. I care more about solving problems than following trends, and I try to keep my work as thoughtful as it is functional." />
        <ProjectsSection />
        <BlogSection />
      </main>
      <Footer isHomePage={true} />
    </>
  );
}
