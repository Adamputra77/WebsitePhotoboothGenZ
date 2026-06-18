/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  Trash2, 
  CameraOff, 
  Sparkles, 
  Heart, 
  Grid, 
  Image as ImageIcon, 
  Compass, 
  Palette, 
  PenTool, 
  Smile, 
  Volume2, 
  Languages, 
  Tv,
  Check,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhotoFilter, DecorativeFrame, StripBackground, CapturedPhoto, UILanguage } from './types';
import { playCountdownBeep, playShutterSnap } from './utils/audio';
import { renderPhotoboothStrip, BACKGROUND_COLORS } from './utils/canvas';

// Language translation mapping
const TRANSLATIONS = {
  id: {
    appTitle: "GEN Z BOOTH",
    appSub: "Ambil momen seru bersama teman secara instan dengan filter menarik dan bingkai estetik ala Korea!",
    cameraAccessDenied: "Akses kamera ditolak. Silakan izinkan permission kamera pada browser Anda.",
    cameraNotFound: "Kamera tidak ditemukan. Pastikan kamera terpasang dengan benar pada perangkat Anda.",
    cameraSuccess: "Kamera berhasil terhubung!",
    startCamera: "Aktifkan Kamera",
    stopCamera: "Matikan Kamera",
    selectCamera: "Pilih Perangkat Lensa",
    photoMode: "Peta Format Cetak",
    singleMode: "1 Foto (Polaroid Square)",
    stripMode: "Strip 4 Foto (Classic Strip)",
    filterTitle: "Efek Filter Lensa",
    frameTitle: "Desain Frame Bingkai",
    frameColor: "Warna Latar Bingkai",
    customTextLabel: "Teks Kustom (Bawah Strip)",
    customTextPlaceholder: "Contoh: HAPPY DAY",
    startSnapping: "MULAI AMBIL FOTO",
    snappingInProgress: "SESI POTRET BERJALAN...",
    countdownText: "Siap-siap...",
    deletePhoto: "Hapus",
    retake: "Retake",
    downloadStrip: "Unduh strip JPG",
    closePreview: "Tutup",
    previewTitle: "Pratinjau Hasil Cetak",
    readyToDownload: "Momen hebatmu telah siap! Klik unduh di bawah ini.",
    noPhotosYet: "Belum ada foto yang diambil.",
    startInstruction: "Nyalakan kamera Anda di panel samping kiri, pilih template bingkai favorit, lalu tekan tombol 'Mulai Ambil Foto'!",
    photosCaptured: "Foto berhasil terkumpul",
    capturedOf: "dari",
    clearSession: "Kosongkan Sesi",
    retakeSlot: "Ulangi Slot Ini",
    captureSingleVacant: "Ambil Foto untuk Slot Ini",
    normalFilter: "Normal (Asli)",
    warmFilter: "Warm (Hangat)",
    coolFilter: "Cool (Bening)",
    bwFilter: "B&W (Klasik)",
    retroFilter: "Retro (Vintage)",
    vividFilter: "Vivid (Terang)",
    frameNone: "Polos (Aesthetic)",
    frameHearts: "Taburan Hati ❤️",
    frameStars: "Kilau Bintang ✨",
    frameFlowers: "Bunga Sakura 🌸",
    bgWhite: "Putih Ivori",
    bgBlack: "Hitam Pekat",
    bgPink: "Pink Pastel",
    bgBlue: "Biru Pastel",
    bgYellow: "Kuning Pastel",
    bgPurple: "Lavendel Pastel",
    cheeseText: "CIIIS! 📸",
  },
  en: {
    appTitle: "Online Photobooth Kiosk",
    appSub: "Capture memorable moments instantly with warm filters and cute Korean-style decorative frames!",
    cameraAccessDenied: "Camera access denied. Please grant camera permission inside your web browser.",
    cameraNotFound: "Camera hardware not located. Please ensure your device's camera is connected.",
    cameraSuccess: "Camera successfully connected!",
    startCamera: "Enable Camera Feed",
    stopCamera: "Disable Camera",
    selectCamera: "Select Camera Device",
    photoMode: "Layout Capture Format",
    singleMode: "1 Photo (Polaroid Square)",
    stripMode: "Strip 4 Photos (Classic Strip)",
    filterTitle: "Lenses & Filter effects",
    frameTitle: "Frame Border Ornament",
    frameColor: "Border Frame Color",
    customTextLabel: "Footer Text Signature",
    customTextPlaceholder: "Example: MEMORY LANE",
    startSnapping: "START PHOTO SESSION",
    snappingInProgress: "CAPTURING LIVE...",
    countdownText: "Get Ready...",
    deletePhoto: "Remove",
    retake: "Retake",
    downloadStrip: "Download strip JPG",
    closePreview: "Close Preview",
    previewTitle: "Live Print Preview",
    readyToDownload: "Your sweet dynamic moments are ready! Hit download below.",
    noPhotosYet: "No photos captured yet.",
    startInstruction: "Turn on your camera feed, choose a delightful layout configuration, and hit 'Start Photo Session'!",
    photosCaptured: "Captured images",
    capturedOf: "of",
    clearSession: "Reset Canvas",
    retakeSlot: "Retake This Slot",
    captureSingleVacant: "Capture vacancy",
    normalFilter: "Normal Tone",
    warmFilter: "Sunset Warm",
    coolFilter: "Breezy Cool",
    bwFilter: "Monochrome B&W",
    retroFilter: "Retro Vintage",
    vividFilter: "Saturated Vivid",
    frameNone: "Plain border",
    frameHearts: "Sweet Hearts ❤️",
    frameStars: "Sparkling Stars ✨",
    frameFlowers: "Blossom Sakura 🌸",
    bgWhite: "Classic Ivory",
    bgBlack: "Onyx Black",
    bgPink: "Soft Pastel Rose",
    bgBlue: "Soft Pastel Sky",
    bgYellow: "Soft Pastel Yellow",
    bgPurple: "Soft Pastel Lavender",
    cheeseText: "CHEESE! 📸",
  }
};

export default function App() {
  // Locale State
  const [lang, setLang] = useState<UILanguage>('id');
  const t = TRANSLATIONS[lang];

  // Camera & Device State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);

  // Booth Preferences
  const [isFourStripMode, setIsFourStripMode] = useState<boolean>(true);
  const [stripLayout, setStripLayout] = useState<'vertical' | 'grid'>('vertical');
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('normal');
  const [selectedFrame, setSelectedFrame] = useState<DecorativeFrame>('hearts');
  const [selectedBackground, setSelectedBackground] = useState<StripBackground>('pink');
  const [customText, setCustomText] = useState<string>('');

  // Captured Images Sandbox
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [renderingStrip, setRenderingStrip] = useState<boolean>(false);
  const [stripDataUrl, setStripDataUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Countdown & Capturing State Machine
  const [countdown, setCountdown] = useState<number>(-1); // -1 is off
  const [isRunningSequence, setIsRunningSequence] = useState<boolean>(false);
  const [currentSessionTargetIndex, setCurrentSessionTargetIndex] = useState<number>(-1);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  // audio helper status
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);

  // DOM references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);
  const activeStreamDeviceIdRef = useRef<string | null>(null);

  // Initialize camera selection & check capability
  useEffect(() => {
    enumerateInputDevices();
    // Auto start on mount
    startCameraStream();

    return () => {
      stopCameraStream();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Hot swap stream when device source is modified
  useEffect(() => {
    if (selectedDeviceId) {
      startCameraStream(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Instantly bind active media stream to the always-mounted video element (Crucial for iOS/Android WebView video activation)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Force trigger playback to overcome browser auto-play sandbox restrictions
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay / stream play was prevented by browser:", error);
        });
      }
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  // Handle auto-regeneration of the combined photo strip when photos, frame, backgrounds or text change
  useEffect(() => {
    if (photos.length > 0) {
      regenerateStrip();
    } else {
      setStripDataUrl(null);
    }
  }, [photos, selectedFilter, selectedFrame, selectedBackground, customText, isFourStripMode, stripLayout, stickers]);

  const enumerateInputDevices = async () => {
    try {
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devicesList.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate input devices:', err);
    }
  };

  const startCameraStream = async (deviceId?: string) => {
    // If we are already streaming, and the requested deviceId is either undefined (meaning use any default) or matches the current active deviceId, skip to avoid race condition/blank screen lockups
    if (stream && (deviceId === undefined || activeStreamDeviceIdRef.current === deviceId)) {
      console.log('Camera is already active and matches requested config. Skipping restart.');
      return;
    }

    setCameraLoading(true);
    setCameraError(null);
    stopCameraStream();

    const constraints: MediaStreamConstraints = {
      video: (deviceId && deviceId !== 'default' && deviceId !== '')
        ? { deviceId: { ideal: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      audio: false
    };

    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err: any) {
      console.warn('First getUserMedia capture failed, attempting front face fallback...', err);
      try {
        // Fallback 1: Force front-facing camera setting
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } catch (fallbackErr: any) {
        console.warn('Front facing fallback failed, attempting generic video fallback...', fallbackErr);
        try {
          // Fallback 2: Any available camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (ultimateErr: any) {
          console.error('Ultimate camera capture request failed:', ultimateErr);
          if (ultimateErr.name === 'NotAllowedError' || ultimateErr.name === 'PermissionDeniedError') {
            setCameraError(t.cameraAccessDenied);
          } else {
            setCameraError(t.cameraNotFound);
          }
          setCameraLoading(false);
          return;
        }
      }
    }

    try {
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Track active device ID
      const activeVideoTrack = mediaStream.getVideoTracks()[0];
      const activeSettings = activeVideoTrack?.getSettings();
      const actualDeviceId = activeSettings?.deviceId || deviceId || null;
      activeStreamDeviceIdRef.current = actualDeviceId;

      if (actualDeviceId && actualDeviceId !== selectedDeviceId) {
        setSelectedDeviceId(actualDeviceId);
      }
      
      // Enumerate list again just in case permissions unlocked more detailed info (labels, etc)
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter(d => d.kind === 'videoinput'));
    } catch (err: any) {
      console.error('Error preparing media stream layout:', err);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    activeStreamDeviceIdRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /**
   * Translates active filter name to CSS classes for the real-time Viewfinder
   */
  const getFilterCssClass = (filter: PhotoFilter) => {
    switch (filter) {
      case 'warm':
        return 'sepia-[0.3] saturate-[1.3] hue-rotate-[-10deg] brightness-[1.02]';
      case 'cool':
        return 'saturate-[0.9] hue-rotate-[15deg] brightness-[1.05] contrast-[1.05]';
      case 'bw':
        return 'grayscale-[100%] contrast-[1.25] brightness-[0.98]';
      case 'retro':
        return 'sepia-[0.4] contrast-[0.95] saturate-[1.1] brightness-[1.02]';
      case 'vivid':
        return 'saturate-[1.5] contrast-[1.15] brightness-[1.02]';
      case 'normal':
      default:
        return 'filter-none';
    }
  };

  /**
   * Action trigger: Begins manual countdown sequence to snap a photo in a target slot index
   */
  const startSingleCaptureCountdown = (targetSlotIndex: number) => {
    if (!stream) return;
    if (countdown > -1) return; // session already running

    setCurrentSessionTargetIndex(targetSlotIndex);
    setCountdown(3);

    if (audioFeedback) playCountdownBeep(false);

    let count = 3;
    const tick = () => {
      count--;
      if (count === 0) {
        setCountdown(0);
        captureAndFlashFrame(targetSlotIndex);
      } else if (count > 0) {
        setCountdown(count);
        if (audioFeedback) playCountdownBeep(false);
        timerRef.current = setTimeout(tick, 1000);
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  /**
   * Action trigger: Launches automated Korean-style sequential 4-photo session
   */
  const startFourStripSession = () => {
    if (!stream) return;
    setIsFourStripMode(true);
    setPhotos([]); // clear existing pictures as we enter a fresh series
    setIsRunningSequence(true);

    const runSeries = (slot: number) => {
      setCurrentSessionTargetIndex(slot);
      setCountdown(3);
      if (audioFeedback) playCountdownBeep(false);

      let count = 3;
      const tick = () => {
        count--;
        if (count === 0) {
          setCountdown(0);
          captureFrameToSession(slot);
          
          const nextSlot = slot + 1;
          // Wait a moment for flash, then proceed to next photo or finish
          timerRef.current = setTimeout(() => {
            if (nextSlot < 4) {
              runSeries(nextSlot);
            } else {
              // Done taking all 4!
              setIsRunningSequence(false);
              setCountdown(-1);
              setCurrentSessionTargetIndex(-1);
              // Open visual download dialog
              setShowPreviewModal(true);
            }
          }, 1800);
        } else if (count > 0) {
          setCountdown(count);
          if (audioFeedback) playCountdownBeep(false);
          timerRef.current = setTimeout(tick, 1000);
        }
      };
      timerRef.current = setTimeout(tick, 1000);
    };

    runSeries(0);
  };

  /**
   * Capture a single picture and show flash (outside serial sequence)
   */
  const captureAndFlashFrame = (slot: number) => {
    // Play shutter sound instantly
    if (audioFeedback) playShutterSnap();
    setFlashActive(true);

    // Hide flash screen after 150ms
    setTimeout(() => {
      setFlashActive(false);
    }, 150);

    setTimeout(() => {
      setCountdown(-1);
      setCurrentSessionTargetIndex(-1);
      savePhotoFromStream(slot);
    }, 300);
  };

  /**
   * Play sweet sound and trigger flash inside chronological series
   */
  const captureFrameToSession = (slot: number) => {
    if (audioFeedback) playShutterSnap();
    setFlashActive(true);

    setTimeout(() => {
      setFlashActive(false);
    }, 150);

    savePhotoFromStream(slot);
    // Stay at countdown: 0 (cheese) for a brief feedback window while transitioning
  };

  /**
   * Grabs a raw image frame from the `<video>` stream, honors horizontal mirror flipped orientation,
   * and saves it to the React state.
   */
  const savePhotoFromStream = (targetSlot: number) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;

    // Create intermediate canvas to read frames and apply mirror flip
    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = videoW;
    rawCanvas.height = videoH;
    const rawCtx = rawCanvas.getContext('2d');

    if (rawCtx) {
      // Flip canvas context horizontally representing mirrored feedback
      rawCtx.translate(videoW, 0);
      rawCtx.scale(-1, 1);
      
      // Feed frame raw data
      rawCtx.drawImage(video, 0, 0, videoW, videoH);
      const outputDataUrl = rawCanvas.toDataURL('image/jpeg', 0.95);

      setPhotos(prev => {
        const item: CapturedPhoto = {
          id: targetSlot >= 0 ? `slot-${targetSlot}` : `photo-${Date.now()}`,
          dataUrl: outputDataUrl,
          timestamp: Date.now(),
        };

        const updated = [...prev];
        // If the targetSlot matches, insert or replace it
        if (targetSlot >= 0) {
          updated[targetSlot] = item;
        } else {
          updated.push(item);
        }
        return updated.filter(Boolean); // clear out null indexes
      });
    }
  };

  /**
   * Compiles elements on high resolution canvas to update image strip dataURL link on the fly
   */
  const regenerateStrip = async () => {
    if (photos.length === 0) return;
    setRenderingStrip(true);
    try {
      // Filter out any empty positions
      const validPhotoUrls = photos.map(p => p.dataUrl);
      
      // If we are in 4-strip mode but have less than 4 photos, we pad it with a beautiful camera-off placeholder or standard black slot in rendering. Let's make sure we have images.
      const renderedUrl = await renderPhotoboothStrip({
        photos: validPhotoUrls,
        filter: selectedFilter,
        frame: selectedFrame,
        background: selectedBackground,
        customText,
        isFourStripMode,
        stripLayout,
        stickers,
      });
      setStripDataUrl(renderedUrl);
    } catch (err) {
      console.error('Failed to draw or update combined photobooth strip:', err);
    } finally {
      setRenderingStrip(false);
    }
  };

  /**
   * Clears everything or deletes individual captured photos
   */
  const handleDeletePhotoAtIndex = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleClearSession = () => {
    setPhotos([]);
    setStripDataUrl(null);
    setIsRunningSequence(false);
    setCountdown(-1);
    setCurrentSessionTargetIndex(-1);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
    }
  };

  const activeDragStickerId = useRef<string | null>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleStickerDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    activeDragStickerId.current = id;
    const currentTarget = e.currentTarget;
    const parentNode = currentTarget.parentNode as HTMLElement;
    if (!parentNode) return;
    const rect = parentNode.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const st = stickers.find(s => s.id === id);
    if (st) {
      const stPxX = st.x * rect.width;
      const stPxY = st.y * rect.height;
      dragStartOffset.current = {
        x: currentX - stPxX,
        y: currentY - stPxY
      };
    }
  };

  const handleStickerTouchStart = (e: React.TouchEvent, id: string) => {
    activeDragStickerId.current = id;
    const currentTarget = e.currentTarget;
    const parentNode = currentTarget.parentNode as HTMLElement;
    if (!parentNode) return;
    const rect = parentNode.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    const st = stickers.find(s => s.id === id);
    if (st) {
      const stPxX = st.x * rect.width;
      const stPxY = st.y * rect.height;
      dragStartOffset.current = {
        x: currentX - stPxX,
        y: currentY - stPxY
      };
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!activeDragStickerId.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const targetX = mouseX - dragStartOffset.current.x;
    const targetY = mouseY - dragStartOffset.current.y;
    
    const relativeX = Math.max(0, Math.min(1, targetX / rect.width));
    const relativeY = Math.max(0, Math.min(1, targetY / rect.height));
    
    setStickers(prev => prev.map(st => 
      st.id === activeDragStickerId.current 
        ? { ...st, x: relativeX, y: relativeY }
        : st
    ));
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    if (!activeDragStickerId.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    
    const targetX = mouseX - dragStartOffset.current.x;
    const targetY = mouseY - dragStartOffset.current.y;
    
    const relativeX = Math.max(0, Math.min(1, targetX / rect.width));
    const relativeY = Math.max(0, Math.min(1, targetY / rect.height));
    
    setStickers(prev => prev.map(st => 
      st.id === activeDragStickerId.current 
        ? { ...st, x: relativeX, y: relativeY }
        : st
    ));
  };

  const handleMouseUp = () => {
    activeDragStickerId.current = null;
  };

  const handleTouchEnd = () => {
    activeDragStickerId.current = null;
  };

  const handleDeleteSticker = (id: string) => {
    setStickers(prev => prev.filter(st => st.id !== id));
  };

  const handleClearStickers = () => {
    setStickers([]);
  };

  const handleDownload = () => {
    if (!stripDataUrl) return;
    const downloadLink = document.createElement('a');
    const safeText = customText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'booth';
    const timestamp = Math.floor(Date.now() / 1000);
    
    downloadLink.href = stripDataUrl;
    downloadLink.download = `photobooth_${safeText}_${timestamp}.jpg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Helper colors configuration list
  const FRAME_COLORS: { id: StripBackground; labelId: string; hex: string; ringClass: string }[] = [
    { id: 'white', labelId: 'bgWhite', hex: BACKGROUND_COLORS.white, ringClass: 'ring-gray-300' },
    { id: 'black', labelId: 'bgBlack', hex: BACKGROUND_COLORS.black, ringClass: 'ring-gray-900' },
    { id: 'pink', labelId: 'bgPink', hex: BACKGROUND_COLORS.pink, ringClass: 'ring-pink-300' },
    { id: 'blue', labelId: 'bgBlue', hex: BACKGROUND_COLORS.blue, ringClass: 'ring-blue-300' },
    { id: 'yellow', labelId: 'bgYellow', hex: BACKGROUND_COLORS.yellow, ringClass: 'ring-yellow-300' },
    { id: 'purple', labelId: 'bgPurple', hex: BACKGROUND_COLORS.purple, ringClass: 'ring-purple-300' },
  ];

  const FILTER_OPTIONS: { id: PhotoFilter; labelId: string; description: string }[] = [
    { id: 'normal', labelId: 'normalFilter', description: 'Original scale' },
    { id: 'warm', labelId: 'warmFilter', description: 'Sun warmth sepia' },
    { id: 'cool', labelId: 'coolFilter', description: 'Clean neon brightness' },
    { id: 'bw', labelId: 'bwFilter', description: 'High contrast monochrome' },
    { id: 'retro', labelId: 'retroFilter', description: '90s nostalgic polaroid' },
    { id: 'vivid', labelId: 'vividFilter', description: 'Saturated vivid colors' },
  ];

  const FRAME_DESIGNS: { id: DecorativeFrame; labelId: string; icon: any }[] = [
    { id: 'none', labelId: 'frameNone', icon: ImageIcon },
    { id: 'hearts', labelId: 'frameHearts', icon: Heart },
    { id: 'stars', labelId: 'frameStars', icon: Sparkles },
    { id: 'flowers', labelId: 'frameFlowers', icon: Smile },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E12] text-gray-100 font-sans selection:bg-pink-500 selection:text-white pb-16 pattern-grid">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0E0E12]/85 border-b border-white/10 py-4 px-6 md:px-12 flex flex-col sm:flex-row gap-4 justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-soft shadow-pink-500/20">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-black uppercase">
                {t.appTitle}
              </span>
              <span className="bg-white/10 text-pink-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10 font-mono">
                Aesthetic
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Feedback Toggle */}
          <button 
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              audioFeedback 
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 font-bold shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
            title="Toggle system sound synth"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">{audioFeedback ? 'SFX ON' : 'SFX OFF'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(prev => prev === 'id' ? 'en' : 'id')}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-all font-mono font-bold text-xs text-gray-200 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-pink-400" />
            <span className="uppercase">{lang}</span>
          </button>
        </div>
      </header>

      {/* FLASH SCREEN EFFECT CONTAINER */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            id="shutter-flash-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 font-sans">
        
        {/* Intro Hero banner */}
        <div className="mb-8 mt-2 text-center md:text-left">
          <p className="text-xs text-pink-500 font-extrabold uppercase tracking-[0.25em] mb-1">{t.appTitle} Studio</p>
          <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
            {t.appSub}
          </p>
        </div>

        {/* 2. CHOSEN LAYOUT GRID */}
        <div id="booth-core-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT WING: VIEW-FINDER CAMERA & THUMBNAILS (COL-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Camera Viewfinder Kiosk Card */}
            <div className="bg-[#13111C]/90 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-soft relative overflow-hidden flex flex-col">
              
              {/* Header inside Viewfinder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stream ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgb(74,222,128)]' : 'bg-gray-600'}`} />
                  <span className="text-xs font-black text-gray-300 uppercase tracking-widest font-mono">
                    {stream ? 'Live Feed' : 'Offline Camera'}
                  </span>
                </div>

                {/* Device Camera Selector dropdown */}
                {devices.length > 1 && stream && (
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="text-xs bg-black/40 border border-white/10 text-white rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer font-mono"
                    >
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId} className="bg-[#13111C]">
                          {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* VIEWPORT STAGE CONTAINER */}
              <div id="video-frame-viewfinder" className="aspect-[4/3] bg-black/50 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center group-hover:scale-[1.01] transition-transform border border-white/5">
                
                {/* Mirrored real-time video element (Always in DOM to ensure videoRef is consistently bound, resolving mobile black screen issues) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] transition-all object-center ${getFilterCssClass(selectedFilter)} ${stream ? 'block' : 'hidden'}`}
                />

                {!stream && (
                  // Fallback feed if video not started
                  <div className="flex flex-col items-center p-8 text-center max-w-sm absolute inset-0 justify-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 mb-4 border border-white/10">
                      <CameraOff className="w-8 h-8 text-pink-500/80" />
                    </div>
                    {cameraError ? (
                      <p className="text-sm text-red-400 font-medium mb-1">{cameraError}</p>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium mb-4">{t.startInstruction}</p>
                    )}
                    {!cameraError && (
                      <button
                        onClick={() => startCameraStream()}
                        disabled={cameraLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 disabled:bg-gray-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-pink-900/10 transition-all cursor-pointer border border-white/10"
                      >
                        <RefreshCw className={`w-4 h-4 ${cameraLoading ? 'animate-spin' : ''}`} />
                        {t.startCamera}
                      </button>
                    )}
                  </div>
                )}

                {/* COUNTDOWN LAYER */}
                <AnimatePresence>
                  {countdown > -1 && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="absolute inset-0 bg-pink-950/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center"
                    >
                      <span className="text-xs uppercase font-extrabold text-pink-300 tracking-[0.2em] mb-2 font-mono">
                        {t.countdownText}
                      </span>
                      <motion.span 
                        key={countdown}
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        className="text-8xl md:text-9xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      >
                        {countdown === 0 ? t.cheeseText : countdown}
                      </motion.span>
                      
                      {/* Active target photo slot index visual */}
                      {isFourStripMode && currentSessionTargetIndex >= 0 && (
                        <div className="mt-6 bg-white/10 border border-white/20 rounded-full px-4 py-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-white font-mono">
                            Slot {currentSessionTargetIndex + 1} / 4
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CURRENT ACTIVE FILTER WATERMARK */}
                {stream && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[10px] text-pink-300 px-3 py-1 rounded-full font-mono font-bold border border-white/10 shadow-sm uppercase tracking-wider">
                    📸 {selectedFilter}
                  </div>
                )}
              </div>

              {/* Viewfinder Controls & Camera Hardware Toggles */}
              <div className="mt-4 flex flex-wrap gap-3 items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  {stream && (
                    <button
                      onClick={stopCameraStream}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-100 text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CameraOff className="w-4 h-4 text-pink-400" />
                      {t.stopCamera}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleClearSession}
                    className="p-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-red-400 cursor-pointer"
                    title={t.clearSession}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* PREVIEW OF THE CAPTURED INDIVIDUAL PHOTOS */}
            <div className="bg-[#13111C]/90 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-soft">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide font-mono">
                  <ImageIcon className="w-4 h-4 text-pink-500 animate-pulse" />
                  {isFourStripMode ? 'Slots Strip Foto' : 'Daftar Polaroid (Max 1)'}
                </h3>
                {photos.length > 0 && (
                  <span className="text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg font-mono">
                    {photos.length} {t.capturedOf} {isFourStripMode ? '4' : '1'}
                  </span>
                )}
              </div>

              {isFourStripMode ? (
                /* Class 4 vertical segments placeholder slots */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((idx) => {
                    const captured = photos[idx];
                    return (
                      <div 
                        key={idx} 
                        className={`aspect-[4/3] rounded-xl overflow-hidden relative border flex flex-col items-center justify-center transition-all group ${
                          captured 
                            ? 'border-white/10 bg-black/40 shadow-sm' 
                            : 'border-dashed border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {captured ? (
                          <>
                            <img 
                              src={captured.dataUrl} 
                              alt={`Slot ${idx}`} 
                              className={`w-full h-full object-cover scale-x-[-1] ${getFilterCssClass(selectedFilter)}`} 
                            />
                            {/* Individual picture actions panel */}
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                              {stream && (
                                <button
                                  onClick={() => startSingleCaptureCountdown(idx)}
                                  className="w-full text-center py-1 bg-white hover:bg-pink-500 hover:text-white text-gray-950 text-[10px] font-black rounded-md transition-all shadow cursor-pointer font-mono"
                                >
                                  {t.retakeSlot}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePhotoAtIndex(idx)}
                                className="w-full text-center py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md transition-all shadow flex items-center justify-center gap-1 cursor-pointer font-mono"
                              >
                                <Trash2 className="w-3 h-3" />
                                {t.deletePhoto}
                              </button>
                            </div>
                            {/* slot index absolute indicator badge */}
                            <span className="absolute bottom-1.5 left-1.5 bg-black/60 border border-white/10 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center p-2 text-center">
                            <span className="w-7 h-7 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400 mb-1 flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            {stream ? (
                              <button
                                onClick={() => startSingleCaptureCountdown(idx)}
                                className="text-[10px] font-bold text-pink-400 hover:underline flex items-center gap-0.5 cursor-pointer font-mono"
                              >
                                <Plus className="w-3 h-3" />
                                Ambil
                              </button>
                            ) : (
                              <span className="text-[9px] text-gray-500 font-mono">Vakum</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Polaroid single image container */
                <div className="flex justify-center">
                  {photos[0] ? (
                    <div className="aspect-square w-full max-w-[240px] rounded-2xl overflow-hidden relative border border-white/10 bg-white/5 group">
                      <img 
                        src={photos[0].dataUrl} 
                        alt="Polaroid" 
                        className={`w-full h-full object-cover scale-x-[-1] ${getFilterCssClass(selectedFilter)}`} 
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {stream && (
                          <button
                            onClick={() => startSingleCaptureCountdown(0)}
                            className="p-2.5 bg-white text-gray-950 rounded-xl hover:bg-pink-500 hover:text-white transition-all shadow cursor-pointer"
                            title="Retake Photo"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePhotoAtIndex(0)}
                          className="p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow cursor-pointer"
                          title="Hapus Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/10">
                        Square Portrait
                      </span>
                    </div>
                  ) : (
                    <div className="w-full text-center py-8 text-gray-400 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5">
                      <ImageIcon className="w-8 h-8 text-pink-500/40 mb-2 animate-pulse" />
                      <p className="text-xs text-gray-450 font-medium">Belum ada foto slot tunggal yang diambil.</p>
                      {stream && (
                        <button
                          onClick={() => startSingleCaptureCountdown(0)}
                          className="mt-3 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer border border-white/10"
                        >
                          Ambil Foto Polaroid
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT WING: SETTINGS PANEL & PRINT PREVIEW TRIGGER (COL-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
            
            {/* Control Form Options Card */}
            <div id="booth-settings-panel" className="bg-[#13111C]/90 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-soft flex flex-col gap-5">
              
              {/* Header */}
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <Palette className="w-5 h-5 text-pink-500 animate-pulse" />
                  Kustomisasi Hasil Cetak
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-mono">Konfigurasi output gaya foto di bawah ini secara bebas</p>
              </div>

              {/* 1. SELECTION MODE -> 1 CUT / 4 CUTS */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Grid className="w-3.5 h-3.5 text-pink-500" />
                  {t.photoMode}
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => {
                      setIsFourStripMode(false);
                      // Crop out additional photos to single format safely
                      if (photos.length > 1) {
                        setPhotos([photos[0]]);
                      }
                    }}
                    disabled={isRunningSequence}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col gap-1 cursor-pointer select-none ${
                      !isFourStripMode 
                        ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/20' 
                        : 'border-white/10 bg-[#1A1A26]/40 hover:bg-[#1A1A26]/80'
                    } disabled:opacity-50`}
                  >
                    <span className="text-xs font-black block text-white">
                      {t.singleMode}
                    </span>
                    <span className="text-[10px] text-gray-400">1 Portrait card</span>
                    {!isFourStripMode && (
                      <span className="absolute bottom-2 right-2 bg-pink-500 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsFourStripMode(true);
                    }}
                    disabled={isRunningSequence}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col gap-1 cursor-pointer select-none ${
                      isFourStripMode 
                        ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/20' 
                        : 'border-white/10 bg-[#1A1A26]/40 hover:bg-[#1A1A26]/80'
                    } disabled:opacity-50`}
                  >
                    <span className="text-xs font-black block text-white">
                      {t.stripMode}
                    </span>
                    <span className="text-[10px] text-gray-400">4 Vertical strip cuts</span>
                    {isFourStripMode && (
                      <span className="absolute bottom-2 right-2 bg-pink-500 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>

                {isFourStripMode && (
                  <div className="mt-2.5 bg-pink-500/5 p-3 rounded-2xl border border-pink-500/10">
                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5 font-mono mb-2">
                      <Grid className="w-3.5 h-3.5 text-pink-400" />
                      Orientasi Strip Cetak
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStripLayout('vertical')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          stripLayout === 'vertical'
                            ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                            : 'border-white/5 bg-[#11111A]/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>縦 Vertikal (1x4)</span>
                      </button>
                      <button
                        onClick={() => setStripLayout('grid')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          stripLayout === 'grid'
                            ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                            : 'border-white/5 bg-[#11111A]/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>田 Grid (2x2)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. FILTER CHOOSER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Compass className="w-3.5 h-3.5 text-pink-500" />
                  {t.filterTitle}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedFilter(opt.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedFilter === opt.id
                          ? 'border-pink-500 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold shadow-md'
                          : 'border-white/10 bg-[#11111A]/60 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {t[opt.labelId as keyof typeof t] || opt.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. FRAME BORDER CHOOSER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  {t.frameTitle}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {FRAME_DESIGNS.map((opt) => {
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedFrame(opt.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                          selectedFrame === opt.id
                            ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold ring-1 ring-pink-500/20'
                            : 'border-white/10 bg-[#11111A]/60 hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${selectedFrame === opt.id ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`} />
                        {t[opt.labelId as keyof typeof t] || opt.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. BACKGROUND SWATCH REVOLVER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  {t.frameColor}
                </label>
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-2.5 rounded-2xl overflow-x-auto">
                  {FRAME_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelectedBackground(col.id)}
                      className={`w-9 h-9 rounded-full relative border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                        selectedBackground === col.id 
                          ? `ring-4 ring-pink-500 scale-105 z-10` 
                          : 'border-white/10'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={t[col.labelId as keyof typeof t]}
                    >
                      {selectedBackground === col.id && (
                        <Check className={`w-4 h-4 font-bold ${col.id === 'white' || col.id === 'yellow' ? 'text-gray-900' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-pink-400 font-mono pl-1 tracking-wider uppercase">
                    {selectedBackground}
                  </span>
                </div>
              </div>

              {/* 5. CUSTOM FOOTER WRITER */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between gap-1.5 font-mono">
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-pink-500" />
                    {t.customTextLabel}
                  </span>
                  <span className="text-[10px] text-gray-550 font-normal">
                    {customText.length}/20 chars
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={t.customTextPlaceholder}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all font-medium font-sans"
                />
              </div>

              {/* AUTOMATED SHUTTER ACTIVATOR ACTION BUTTON */}
              <div className="mt-2 flex flex-col gap-3">
                
                {stream ? (
                  isFourStripMode ? (
                    /* Automated strip sequences */
                    <button
                      onClick={startFourStripSession}
                      disabled={isRunningSequence}
                      className={`w-full py-4 text-sm font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer tracking-wider ${
                        isRunningSequence
                          ? 'bg-amber-500 text-white shadow-amber-500/20'
                          : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-pink-500/30'
                      }`}
                    >
                      <Camera className={`w-5 h-5 ${isRunningSequence ? 'animate-bounce' : ''}`} />
                      {isRunningSequence ? t.snappingInProgress : t.startSnapping}
                    </button>
                  ) : (
                    /* Single photo count action */
                    <button
                      onClick={() => startSingleCaptureCountdown(-1)}
                      disabled={countdown > -1}
                      className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-pink-500/30 cursor-pointer tracking-wider"
                    >
                      <Camera className="w-5 h-5" />
                      {countdown > -1 ? t.snappingInProgress : "AMBIL FOTO TUNGGAL"}
                    </button>
                  )
                ) : (
                  /* Disabled state if camera stream is active else */
                  <button
                    onClick={() => startCameraStream()}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                  >
                    <Tv className="w-5 h-5 text-gray-400" />
                    Buka Kamera Dahulu
                  </button>
                )}

              </div>

            </div>

            {/* QUICK PREVIEW & DOWNLOAD CARD */}
            {photos.length > 0 && (
              <div className="bg-[#13111C]/95 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-soft flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                    Kertas Strip Akhir
                  </span>
                  
                  <button 
                    onClick={() => setShowPreviewModal(true)}
                    className="text-xs font-black text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-lg border border-pink-500/20 cursor-pointer transition-all"
                  >
                    Buka Preview Cetak
                  </button>
                </div>

                {renderingStrip ? (
                  <div className="h-24 flex items-center justify-center text-xs text-gray-400 gap-2 font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                    Rendering cetak strip...
                  </div>
                ) : (
                  stripDataUrl && (
                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="w-14 overflow-hidden rounded-lg shadow-sm border border-white/10 bg-black flex-shrink-0">
                        <img src={stripDataUrl} alt="mini-strip" className="w-full h-auto aspect-[1/3] object-cover animate-fade-in" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-white truncate">
                          {isFourStripMode ? 'Strip Cetak 4-Cuts' : 'Polaroid 1-Cut'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">Format JPG • High Fidelity Ready</p>
                        
                        <button
                          onClick={handleDownload}
                          className="mt-2.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:brightness-110 text-white text-[10px] font-black rounded-lg transition-all shadow-md shadow-pink-500/10 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t.downloadStrip}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          </div>

        </div>

        {/* 3. INFORMATION GUIDE */}
        <div className="mt-12 bg-[#13111C]/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-soft">
          <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2 font-mono">
            <span className="text-pink-400 animate-pulse">💡</span> Petunjuk Penggunaan & Tips Photobooth
          </h3>
          <ul className="text-xs text-gray-300 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 list-disc list-inside">
            <li>Gunakan ruangan yang terang atau menghadap cahaya agar hasil jepretan Anda maksimal.</li>
            <li>Anda bebas mengganti <b className="text-pink-400">Filter Lensa, Frame, Warna Latar, maupun Teks</b> kapan saja tanpa harus mengambil ulang foto.</li>
            <li>Pilihan frame dan filter akan langsung diterapkan ke hasil gabungan render dan siap cetak.</li>
            <li>Tekan tombol merah <b className="text-pink-400">"MULAI AMBIL FOTO"</b> pada tipe 4-strip untuk memulai rangkaian countdown otomatis.</li>
            <li>Gunakan fitur hapus/retake slot individual jika pose atau ekspresi Anda kurang cocok di slot tertentu.</li>
            <li>Kamera di-mirror secara mendatar untuk meniru cermin asli pada bilik photobooth Korea sesungguhnya.</li>
          </ul>
        </div>

      </main>

      {/* 4. HIGH FIDELITY PRINT MODAL PREVIEW BACKGROUND */}
      <AnimatePresence>
        {showPreviewModal && stripDataUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#13111C] rounded-3xl p-6 max-w-md w-full max-h-[90vh] flex flex-col relative shadow-2xl border border-white/10"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 flex-shrink-0">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">{t.previewTitle}</h3>
                  <p className="text-xs text-gray-400">{t.readyToDownload}</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold transition-all border border-white/10 cursor-pointer font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Sticker selection tray */}
              <div className="flex flex-col gap-1 px-1 mb-3 flex-shrink-0">
                <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest flex items-center gap-1 font-mono">
                  ✨ PILIH STIKER (Klik untuk tambah & seret!)
                </span>
                <div className="flex gap-2 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-pink-500/30">
                  {['❤️', '💖', '⭐', '✨', '👑', '🦋', '🌸', '🌼', '🌈', '🔥', '⚡', '🍀', '🧸', '🐱', '🎀', '🎈', '🎉', '🍦', '🍰', '👽'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setStickers(prev => [...prev, {
                          id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                          emoji,
                          x: 0.5,
                          y: 0.4
                        }]);
                      }}
                      className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-xl bg-white/5 hover:bg-pink-500/20 active:scale-90 transition-all rounded-xl border border-white/10 cursor-pointer text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable container for full length vertical photostrip image */}
              <div id="full-resolution-paper-print" className="flex-1 overflow-y-auto flex justify-center bg-black/40 p-3 rounded-2xl border border-white/10 mb-4 max-h-[46vh]">
                <div 
                  className="w-full max-w-[200px] relative transition-all"
                  onMouseMove={handleContainerMouseMove}
                  onTouchMove={handleContainerTouchMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={stripDataUrl}
                    alt="Compiled Aesthetic Photobooth Strip"
                    className="w-full h-auto rounded-md shadow-md block border border-white/10 select-none pointer-events-none"
                    draggable="false"
                  />
                  
                  {/* Absolute overlay for dragging stickers */}
                  <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-auto">
                    {stickers.map(st => (
                      <div
                        key={st.id}
                        onMouseDown={(e) => handleStickerDragStart(e, st.id)}
                        onTouchStart={(e) => handleStickerTouchStart(e, st.id)}
                        onDoubleClick={() => handleDeleteSticker(st.id)}
                        style={{
                          position: 'absolute',
                          left: `${st.x * 100}%`,
                          top: `${st.y * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: '32px',
                          cursor: 'move',
                          userSelect: 'none',
                          touchAction: 'none',
                          zIndex: 30,
                        }}
                        className="hover:scale-125 hover:rotate-6 active:scale-110 active:opacity-90 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none"
                        title="Geser stiker ini, klik dua kali untuk hapus!"
                      >
                        {st.emoji}
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {stickers.length > 0 && (
                  <button
                    onClick={handleClearStickers}
                    className="w-full py-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-gray-400 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer font-mono"
                  >
                    🗑️ HAPUS SEMUA STIKER ({stickers.length})
                  </button>
                )}
                
                <button
                  onClick={handleDownload}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadStrip}
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/10 rounded-xl text-xs transition-all text-center cursor-pointer"
                >
                  {t.closePreview}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
