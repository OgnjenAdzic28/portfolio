"use client";

import Image from "next/image";
import Link from "next/link";
import { BorderBeam } from "@/components/magicui/border-beam";

/**
 * VentureCard - A customizable card component for displaying ventures/projects
 *
 * Features:
 * - Left column with image/logo and title/subtitle
 * - Right side with background image using CSS mask fade effect
 * - Optional BorderBeam animation for primary cards
 * - Customizable blurry circular gradient on hover (bottom left, responsive: 400px on mobile, 200px on lg+)
 * - Optional Next.js Link wrapper for navigation
 * - Fully customizable styling and layout
 * - Subtitle text with blending difference mode
 *
 * Usage:
 * Wrap with motion.div for animations:
 *
 * <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
 *   <VentureCard
 *     cardImage="/logo.svg"
 *     title="Project Name"
 *     subtitle="Description of the project"
 *     bgImage="/background.jpg"
 *     isPrimary={true}
 *     cardImageInvert={false} // Optional: disable dark mode invert
 *     bgImageInvert={false} // Optional: disable background image invert
 *     hoverGradientColor="#3b82f6" // Optional: customize hover gradient color
 *     hoverGradientIntensity={0.8} // Optional: customize hover gradient intensity (0-1)
 *     bgImageObjectPosition="top center" // Optional: control background image position
 *     href="/projects/project-name" // Optional: make card clickable with Next.js Link
 *     linkTarget="_blank" // Optional: open link in new tab
 *   />
 * </motion.div>
 */

interface VentureCardProps {
  // Card content
  cardImage: string;
  cardImageDark?: string; // Optional dark mode image
  cardImageAlt?: string;
  title: string;
  subtitle: string;
  bgImage: string;

  // Styling options
  isPrimary?: boolean;

  // BorderBeam customization (only for primary cards)
  borderBeamSize?: number;
  borderBeamDuration?: number;
  borderBeamColorFrom?: string;
  borderBeamColorTo?: string;
  borderBeamWidth?: number;
  borderBeamDelay?: number;

  // Layout customization
  cardImageWidth?: string;
  cardImageHeight?: string;
  cardImageInvert?: boolean;
  cardImageObjectFit?: string;
  bgImageOpacityClass?: string;
  bgImageWidth?: string;
  bgImageObjectPosition?: string;
  bgImageInvert?: boolean;
  maskGradient?: string;

  // Text styling
  titleClassName?: string;
  subtitleClassName?: string;

  // Card styling
  cardClassName?: string;

  // Hover gradient customization
  hoverGradientEnabled?: boolean;
  hoverGradientColor?: string;
  hoverGradientIntensity?: number;
  hoverGradientBlur?: string;

  // Link functionality
  href?: string;
  linkTarget?: "_blank" | "_self" | "_parent" | "_top";
  linkClassName?: string;
}

export default function VentureCard({
  cardImage,
  cardImageDark,
  cardImageAlt = "Card image",
  title,
  subtitle,
  bgImage,
  isPrimary = false,
  borderBeamSize = 100,
  borderBeamDuration = 8,
  borderBeamColorFrom = "#ffffff",
  borderBeamColorTo = "#fff",
  borderBeamWidth = 1,
  borderBeamDelay = 0,
  cardImageWidth = "w-28",
  cardImageHeight = "h-full",
  cardImageInvert = true,
  cardImageObjectFit = "contain",
  bgImageOpacityClass = "lg:opacity-100 opacity-10",
  bgImageWidth = "w-full lg:w-[70%]",
  bgImageObjectPosition = "center",
  bgImageInvert,
  maskGradient = "linear-gradient(to right, transparent 0%, black 50%, black 100%)",
  titleClassName = "text-base font-medium text-foreground",
  subtitleClassName = "text-sm text-muted-foreground leading-normal",
  cardClassName = "flex-1 h-full w-full",
  hoverGradientEnabled = true,
  hoverGradientColor = "#3b82f6",
  hoverGradientIntensity = 0.6,
  hoverGradientBlur = "60px",
  href,
  linkTarget = "_blank",
  linkClassName = "",
}: VentureCardProps) {
  // Helper function to determine if a color is light
  const isLightColor = (color: string): boolean => {
    try {
      // Convert hex color to RGB
      const hex = color.replace("#", "");

      // Handle 3-character hex codes by expanding them
      const fullHex =
        hex.length === 3
          ? hex
              .split("")
              .map((char) => char + char)
              .join("")
          : hex;

      const r = parseInt(fullHex.substring(0, 2), 16);
      const g = parseInt(fullHex.substring(2, 4), 16);
      const b = parseInt(fullHex.substring(4, 6), 16);

      // Check if parsing was successful
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        return false; // Default to dark if color parsing fails
      }

      // Calculate luminance using the relative luminance formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Consider colors with luminance > 0.7 as light
      return luminance > 0.7;
    } catch {
      return false; // Default to dark if any error occurs
    }
  };

  // Check if the hover gradient color is light
  const isHoverColorLight = isLightColor(hoverGradientColor);

  // Check if border beam colors are light and need inversion for light mode
  const isBorderBeamFromLight = isLightColor(borderBeamColorFrom);
  const isBorderBeamToLight = isLightColor(borderBeamColorTo);

  // Create inverted border beam colors for light mode if needed
  const lightModeBorderBeamColorFrom = isBorderBeamFromLight
    ? "#000000"
    : borderBeamColorFrom;
  const lightModeBorderBeamColorTo = isBorderBeamToLight
    ? "#333333"
    : borderBeamColorTo;

  const cardContent = (
    <div className="relative overflow-hidden bg-card rounded-xl border shadow-sm h-full w-full group **:select-none">
      {/* BorderBeam for primary cards */}
      {isPrimary && (
        <>
          {/* Light mode border beam - use inverted colors if original colors are too light */}
          <BorderBeam
            size={borderBeamSize}
            duration={borderBeamDuration}
            colorFrom={lightModeBorderBeamColorFrom}
            colorTo={lightModeBorderBeamColorTo}
            borderWidth={borderBeamWidth}
            delay={borderBeamDelay}
            className="dark:hidden"
          />
          {/* Dark mode border beam - always use original colors */}
          <BorderBeam
            size={borderBeamSize}
            duration={borderBeamDuration}
            colorFrom={borderBeamColorFrom}
            colorTo={borderBeamColorTo}
            borderWidth={borderBeamWidth}
            delay={borderBeamDelay}
            className="hidden dark:block"
          />
        </>
      )}

      {/* Hover Gradient Effect */}
      {hoverGradientEnabled && (
        <>
          {/* Light mode gradient - use black if original color is light, otherwise use original */}
          <div
            className="absolute bottom-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none w-[1500px] h-[50px] lg:w-[200px] lg:h-[200px] dark:hidden"
            style={{
              background: `radial-gradient(circle, ${isHoverColorLight ? "#000000" : hoverGradientColor}${Math.round(
                hoverGradientIntensity * 255
              )
                .toString(16)
                .padStart(2, "0")} 0%, transparent 70%)`,
              filter: `blur(${hoverGradientBlur})`,
              transform: "translate(-50%, 50%)",
            }}
          />
          {/* Dark mode gradient - always use original color */}
          <div
            className="absolute bottom-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none w-[1500px] h-[50px] lg:w-[200px] lg:h-[200px] hidden dark:block"
            style={{
              background: `radial-gradient(circle, ${hoverGradientColor}${Math.round(
                hoverGradientIntensity * 255
              )
                .toString(16)
                .padStart(2, "0")} 0%, transparent 70%)`,
              filter: `blur(${hoverGradientBlur})`,
              transform: "translate(-50%, 50%)",
            }}
          />
        </>
      )}

      <div className="w-full flex-1 flex h-full">
        {/* Left Column */}
        <div className="h-full w-full flex-1 justify-between flex flex-col relative z-10">
          {/* Card Image/Logo */}
          <div
            className={`w-full ${cardImageHeight} relative px-6.5 pt-6.5 rounded-lg overflow-hidden flex items-center justify-between`}
          >
            {cardImageDark ? (
              <>
                {/* Light mode image */}
                <Image
                  src={cardImage}
                  alt={cardImageAlt}
                  width={112} // Default width equivalent to w-36
                  height={32} // Default height equivalent to h-12
                  className={`${cardImageWidth} ${cardImageHeight} object-${cardImageObjectFit} dark:hidden`}
                />
                {/* Dark mode image */}
                <Image
                  src={cardImageDark}
                  alt={cardImageAlt}
                  width={112} // Default width equivalent to w-36
                  height={32} // Default height equivalent to h-12
                  className={`${cardImageWidth} ${cardImageHeight} object-${cardImageObjectFit} hidden dark:block`}
                />
              </>
            ) : (
              <Image
                src={cardImage}
                alt={cardImageAlt}
                width={112} // Default width equivalent to w-36
                height={32} // Default height equivalent to h-12
                className={`${cardImageInvert ? "dark:invert invert-0" : "dark:invert-0 invert"} ${cardImageWidth} ${cardImageHeight} object-${cardImageObjectFit}`}
              />
            )}
            {href && (
              <button
                type="button"
                onClick={() => window.open(href, linkTarget)}
                className="lg:hidden flex items-center gap-1 pointer-events-none transition-opacity relative z-10"
                aria-label={`Explore ${title}`}
              >
                <span className="text-sm font-normal text-foreground">
                  Explore
                </span>
                <svg
                  className="w-3 h-3 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <title>Arrow pointing top right</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="p-6.5">
            <h3 className={titleClassName}>{title}</h3>
            <p
              className={subtitleClassName}
              style={{ mixBlendMode: "difference" }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side - Absolute Positioned Image with Mask */}
        <div
          className={`absolute right-0 top-0 bottom-0 ${bgImageWidth} h-full ${bgImageOpacityClass} pointer-events-none z-0`}
        >
          <div
            className={`w-full h-full bg-cover bg-no-repeat ${bgImageInvert !== undefined ? (bgImageInvert ? "dark:invert-0 invert" : "dark:invert invert-0") : ""}`}
            style={{
              backgroundImage: `url('${bgImage}')`,
              backgroundPosition: bgImageObjectPosition,
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cardClassName}>
      {href ? (
        <Link
          href={href}
          target={linkTarget}
          className={`block h-full w-full ${linkClassName}`}
        >
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </div>
  );
}
