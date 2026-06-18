/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhotoFilter, DecorativeFrame, StripBackground } from '../types';

// Map background names to actual hex colors
export const BACKGROUND_COLORS: Record<StripBackground, string> = {
  white: '#FDFDFD',
  black: '#121214',
  pink: '#FFE4E6', // pastel rose
  blue: '#E0F2FE', // pastel sky
  yellow: '#FEF9C3', // pastel lemon
  purple: '#F3E8FF', // pastel lavender
};

/**
 * Draw a vector heart on Canvas
 */
export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, -size / 4);
  ctx.bezierCurveTo(0, -size / 2, -size / 2, -size / 2, -size / 2, -size / 4);
  ctx.bezierCurveTo(-size / 2, size / 8, -size / 8, size / 3, 0, size / 1.5);
  ctx.bezierCurveTo(size / 8, size / 3, size / 2, size / 8, size / 2, -size / 4);
  ctx.bezierCurveTo(size / 2, -size / 2, 0, -size / 2, 0, -size / 4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a cute four-point sparkle star on Canvas
 */
export function drawSparkleStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a cherry blossom / cute flower on Canvas
 */
export function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, petalColor: string, centerColor: string) {
  ctx.save();
  ctx.translate(x, y);
  
  // Draw 5 petals
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.rotate((Math.PI * 2) / 5);
    ctx.ellipse(0, -size / 1.6, size / 2, size / 1.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = petalColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  
  // Center
  ctx.beginPath();
  ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Apply CSS filter equivalence to Canvas 2D Context
 */
export function setCanvasFilter(ctx: CanvasRenderingContext2D, filter: PhotoFilter) {
  // Translate PhotoFilter to ctx.filter format
  switch (filter) {
    case 'warm':
      ctx.filter = 'sepia(0.3) saturate(1.3) hue-rotate(-10deg) brightness(1.02)';
      break;
    case 'cool':
      ctx.filter = 'saturate(0.9) hue-rotate(15deg) brightness(1.05) contrast(1.05)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(1) contrast(1.25) brightness(0.98)';
      break;
    case 'retro':
      ctx.filter = 'sepia(0.4) contrast(0.95) saturate(1.1) brightness(1.02)';
      break;
    case 'vivid':
      ctx.filter = 'saturate(1.5) contrast(1.15) brightness(1.02)';
      break;
    case 'normal':
    default:
      ctx.filter = 'none';
      break;
  }
}

/**
 * Load helper image asynchronously
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for framing: ' + e));
    img.src = src;
  });
}

interface RenderStripOptions {
  photos: string[]; // data URLs
  filter: PhotoFilter;
  frame: DecorativeFrame;
  background: StripBackground;
  customText: string;
  isFourStripMode: boolean;
  stripLayout?: 'vertical' | 'grid';
  stickers?: { id: string; emoji: string; x: number; y: number }[];
}

/**
 * Render the ultimate combined photobooth strip onto a canvas and return the dataURL
 */
export async function renderPhotoboothStrip({
  photos,
  filter,
  frame,
  background,
  customText,
  isFourStripMode,
  stripLayout = 'vertical',
  stickers = [],
}: RenderStripOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create standard canvas context');
  }

  // Load all images first
  const loadedImages = await Promise.all(photos.map(src => loadImage(src)));

  const bgHex = BACKGROUND_COLORS[background];
  const isDarkBackground = background === 'black';

  if (isFourStripMode) {
    if (stripLayout === 'grid') {
      // ----------------------------------------------------
      // CASE A-2: 2x2 GRID STRIP FORMAT
      // Dimensions: 600px width, 760px height
      // ----------------------------------------------------
      const width = 600;
      const height = 760;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw solid background
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, width, height);

      // Photos layout (2x2 grid)
      const slotW = 260;
      const slotH = 260;
      
      const positions = [
        { x: 25, y: 35 },
        { x: 315, y: 35 },
        { x: 25, y: 325 },
        { x: 315, y: 325 },
      ];

      for (let i = 0; i < 4; i++) {
        const { x: slotX, y: slotY } = positions[i];

        // Draw blank background placeholder frame
        ctx.save();
        ctx.shadowColor = isDarkBackground ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = isDarkBackground ? '#1e1e24' : '#ffffff';
        ctx.fillRect(slotX - 4, slotY - 4, slotW + 8, slotH + 8);
        ctx.restore();

        if (loadedImages[i]) {
          const img = loadedImages[i];
          ctx.save();
          setCanvasFilter(ctx, filter);

          // Crop video frame to square for 2x2 grid
          const sizeRect = Math.min(img.width, img.height);
          const sx = (img.width - sizeRect) / 2;
          const sy = (img.height - sizeRect) / 2;

          ctx.drawImage(img, sx, sy, sizeRect, sizeRect, slotX, slotY, slotW, slotH);
          ctx.restore();
        }

        // Draw individual frames overlay over and around
        drawDecorativeFrameOverlays(ctx, slotX, slotY, slotW, slotH, frame, i);
      }

      // Draw beautiful footer
      const footerY = 655;
      drawFooter(ctx, width, footerY, customText, bgHex, isDarkBackground);

      // Draw border ornaments
      drawStripBorderOrnaments(ctx, width, height, frame, isDarkBackground);

    } else {
      // ----------------------------------------------------
      // CASE A-1: CLASSIC 4-PHOTO VERTICAL STRIP
      // Dimensions: 460px width, 1420px height
      // ----------------------------------------------------
      const width = 460;
      const height = 1420;
      
      canvas.width = width;
      canvas.height = height;

      // 1. Draw solid background
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, width, height);

      // 2. Setup photo sizing (4:3 aspect ratio landscape format for strip slots)
      const slotX = 30;
      const slotW = 400;
      const slotH = 300; // 400 * (3 / 4)
      const topMargin = 35;
      const gap = 20;

      // Draw photo slots and images
      for (let i = 0; i < 4; i++) {
        const imgY = topMargin + i * (slotH + gap);

        // Draw blank white placeholder border shadow
        ctx.save();
        ctx.shadowColor = isDarkBackground ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = isDarkBackground ? '#1e1e24' : '#ffffff';
        ctx.fillRect(slotX - 4, imgY - 4, slotW + 8, slotH + 8);
        ctx.restore();

        if (loadedImages[i]) {
          const img = loadedImages[i];
          ctx.save();
          
          // Apply image filters
          setCanvasFilter(ctx, filter);
          
          // Correct aspect ratio cropping & placement inside full 400x300 slot
          const sourceAspect = img.width / img.height;
          const targetAspect = slotW / slotH;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;

          if (sourceAspect > targetAspect) {
            // Video is too wide, crop left/right
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
          } else {
            // Video is too narrow, crop top/bottom
            sh = img.width / targetAspect;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, slotX, imgY, slotW, slotH);
          ctx.restore();
        }

        // Draw frames decoration over and around the images
        drawDecorativeFrameOverlays(ctx, slotX, imgY, slotW, slotH, frame, i);
      }

      // 3. Draw beautiful watermark, logo & date text at the footer
      const footerY = topMargin + 4 * (slotH + gap) + 15;
      drawFooter(ctx, width, footerY, customText, bgHex, isDarkBackground);

      // Draw outer strip borders or overall frame overlays (if desired)
      drawStripBorderOrnaments(ctx, width, height, frame, isDarkBackground);
    }
  } else {
    // ----------------------------------------------------
    // CASE B: 1-PHOTO POLAROID SQ CARD
    // Dimensions: 500px width, 610px height
    // ----------------------------------------------------
    const width = 500;
    const height = 610;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw solid background
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, width, height);

    // 2. Setup polaroid photo layout (typically square, e.g. 440px x 400px, or standard 1:1 format)
    const slotX = 35;
    const slotY = 35;
    const slotW = 430;
    const slotH = 430; // Square format polaroid

    // Draw polaroid base shadow
    ctx.save();
    ctx.shadowColor = isDarkBackground ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = isDarkBackground ? '#1e1e24' : '#ffffff';
    ctx.fillRect(slotX - 3, slotY - 3, slotW + 6, slotH + 6);
    ctx.restore();

    if (loadedImages[0]) {
      const img = loadedImages[0];
      ctx.save();
      setCanvasFilter(ctx, filter);

      // Crop video frame to square
      const sizeRect = Math.min(img.width, img.height);
      const sx = (img.width - sizeRect) / 2;
      const sy = (img.height - sizeRect) / 2;

      ctx.drawImage(img, sx, sy, sizeRect, sizeRect, slotX, slotY, slotW, slotH);
      ctx.restore();
    }

    // Draw decorations
    drawDecorativeFrameOverlays(ctx, slotX, slotY, slotW, slotH, frame, 0);

    // 3. Draw polaroid bottom handwritten/classic note
    const footerY = slotY + slotH + 35;
    drawFooter(ctx, width, footerY, customText, bgHex, isDarkBackground);

    // Frame border decoration
    drawStripBorderOrnaments(ctx, width, height, frame, isDarkBackground);
  }

  // Draw decorative/custom emoji stickers on top of everything
  if (stickers && stickers.length > 0) {
    const renderWidth = canvas.width;
    const renderHeight = canvas.height;
    for (const st of stickers) {
      ctx.save();
      const canvasX = st.x * renderWidth;
      const canvasY = st.y * renderHeight;
      const stickerFontSize = Math.round(renderWidth * 0.08); // 8% of strip width is the ideal scale representation
      ctx.font = `${stickerFontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.emoji, canvasX, canvasY);
      ctx.restore();
    }
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Draws repeating decorative frame ornaments on borders
 */
function drawStripBorderOrnaments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: DecorativeFrame,
  isDark: boolean
) {
  if (frame === 'none') return;

  const steps = 12;
  const padding = 15;

  ctx.save();
  // We can draw subtle icons at the four extreme corners of the strip
  const cornerPoints = [
    { x: padding, y: padding },
    { x: width - padding, y: padding },
    { x: padding, y: height - padding },
    { x: width - padding, y: height - padding }
  ];

  if (frame === 'hearts') {
    cornerPoints.forEach(pt => {
      drawHeart(ctx, pt.x, pt.y, 16, '#F43F5E');
    });
  } else if (frame === 'stars') {
    cornerPoints.forEach(pt => {
      drawSparkleStar(ctx, pt.x, pt.y, 12, '#EAB308');
    });
  } else if (frame === 'flowers') {
    cornerPoints.forEach(pt => {
      drawFlower(ctx, pt.x, pt.y, 10, '#EC4899', '#FCD34D');
    });
  }
  ctx.restore();
}

/**
 * Draw decorative stamps overlapping the corners of individual photo slots
 */
function drawDecorativeFrameOverlays(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: DecorativeFrame,
  index: number
) {
  if (frame === 'none') return;

  ctx.save();
  // Different coordinates depending on the photo index to keep it organic and playful!
  if (frame === 'hearts') {
    // Draw some sweet pink/red hearts around current image corners
    if (index % 2 === 0) {
      drawHeart(ctx, x + 25, y + 25, 14, '#FF4D6D');
      drawHeart(ctx, x + w - 20, y + h - 25, 18, '#FF758F');
      drawHeart(ctx, x + w - 40, y + 30, 10, '#FF85A1');
    } else {
      drawHeart(ctx, x + w - 30, y + 25, 16, '#FF4D6D');
      drawHeart(ctx, x + 20, y + h - 20, 12, '#FF85A1');
      drawHeart(ctx, x + 40, y + h - 45, 15, '#FF758F');
    }
  } else if (frame === 'stars') {
    // Draw pretty glowing golden sparkle stars
    const starColor = '#FACC15'; // Amber 400
    if (index % 2 === 0) {
      drawSparkleStar(ctx, x + 30, y + 20, 12, starColor);
      drawSparkleStar(ctx, x + w - 30, y + h - 20, 14, starColor);
      drawSparkleStar(ctx, x + 25, y + h - 35, 8, '#FFF9C4');
    } else {
      drawSparkleStar(ctx, x + w - 25, y + 30, 13, starColor);
      drawSparkleStar(ctx, x + 25, y + 25, 10, starColor);
      drawSparkleStar(ctx, x + w - 40, y + h - 40, 9, '#FFF9C4');
    }
  } else if (frame === 'flowers') {
    // Draw lovely cherry blossoms / soft daisies overlapping the frames
    const petalPink = '#F472B6'; // Pink 400
    const goldYellow = '#FCD34D'; // Yellow 300
    if (index % 2 === 0) {
      drawFlower(ctx, x + 25, y + 25, 9, petalPink, goldYellow);
      drawFlower(ctx, x + w - 30, y + h - 25, 12, '#FB7185', '#FEF08A');
    } else {
      drawFlower(ctx, x + w - 25, y + 25, 10, '#FB7185', '#FEF08A');
      drawFlower(ctx, x + 30, y + h - 30, 8, petalPink, goldYellow);
    }
  }
  ctx.restore();
}

/**
 * Handle drawing beautiful retro watermarks, titles and clean footer timestamps
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  customText: string,
  bgHex: string,
  isDark: boolean
) {
  ctx.save();
  const mainColor = isDark ? '#F3F4F6' : '#1F2937';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';

  // 1. Divider Line
  ctx.beginPath();
  ctx.moveTo(40, y - 15);
  ctx.lineTo(width - 40, y - 15);
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. Custom User Signature Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Custom font: elegant sans / playful
  ctx.fillStyle = mainColor;
  ctx.font = 'bold 15px "Inter", system-ui, sans-serif';
  ctx.fillText(customText.toUpperCase() || '🌸 INSTABOOTH 🌸', width / 2, y + 5);

  // 3. Compact styled timestamp
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  ctx.fillStyle = subColor;
  ctx.font = 'bold 9px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText(`✨ ${dateStr} ✨`, width / 2, y + 28);
  ctx.restore();
}
