import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  Tv,
  Watch,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Settings,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Share2,
  Grid3X3,
  FileText,
  Loader2,
  PanelLeft,
  PanelRight,
} from 'lucide-react'
import clsx from 'clsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PostSettings {
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarId?: string | null;
}

interface ThemeData {
  name: string;
  slug: string;
  header_html?: string;
  footer_html?: string;
  styles_css?: string;
}

interface SidebarData {
  id: string;
  name: string;
  widgets?: Array<{
    type: string;
    title?: string;
    content?: string;
  }>;
}

interface DevicePreviewProps {
  content: string
  title: string
  className?: string
  onClose?: () => void
  postSettings?: PostSettings
  featuredImage?: { url: string; alt?: string } | null
  author?: string
  publishDate?: string
  categories?: string[]
}

interface Device {
  id: string
  name: string
  category: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'wearable' | 'tv'
  icon: React.ReactNode
  width: number
  height: number
  pixelRatio?: number
  userAgent?: string
  frame?: {
    color: string
    borderRadius: number
    padding: number
    notch?: boolean
    homeButton?: boolean
    dynamicIsland?: boolean
  }
}

const devices: Device[] = [
  // Desktops
  {
    id: 'imac-27',
    name: 'iMac 27"',
    category: 'desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: 2560,
    height: 1440,
    pixelRatio: 2,
    frame: { color: '#c0c0c0', borderRadius: 16, padding: 40 },
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    category: 'desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: 2240,
    height: 1260,
    pixelRatio: 2,
    frame: { color: '#e5e5e5', borderRadius: 16, padding: 40 },
  },
  {
    id: 'studio-display',
    name: 'Studio Display',
    category: 'desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: 2560,
    height: 1440,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 16, padding: 40 },
  },
  // Laptops
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'laptop',
    icon: <Laptop className="w-4 h-4" />,
    width: 1728,
    height: 1117,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 12, padding: 20, notch: true },
  },
  {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    category: 'laptop',
    icon: <Laptop className="w-4 h-4" />,
    width: 1512,
    height: 982,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 12, padding: 20, notch: true },
  },
  {
    id: 'macbook-air',
    name: 'MacBook Air',
    category: 'laptop',
    icon: <Laptop className="w-4 h-4" />,
    width: 1470,
    height: 956,
    pixelRatio: 2,
    frame: { color: '#e5e5e5', borderRadius: 12, padding: 20 },
  },
  {
    id: 'dell-xps-15',
    name: 'Dell XPS 15',
    category: 'laptop',
    icon: <Laptop className="w-4 h-4" />,
    width: 1920,
    height: 1200,
    pixelRatio: 2,
    frame: { color: '#2d2d2d', borderRadius: 8, padding: 16 },
  },
  // Tablets
  {
    id: 'ipad-pro-12',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 24, padding: 20 },
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: 'tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 834,
    height: 1194,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 24, padding: 20 },
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 820,
    height: 1180,
    pixelRatio: 2,
    frame: { color: '#e5e5e5', borderRadius: 24, padding: 20 },
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    category: 'tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 768,
    height: 1024,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 20, padding: 16, homeButton: true },
  },
  {
    id: 'galaxy-tab-s8',
    name: 'Galaxy Tab S8',
    category: 'tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: 800,
    height: 1280,
    pixelRatio: 2,
    frame: { color: '#2d2d2d', borderRadius: 16, padding: 12 },
  },
  // Mobile
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 430,
    height: 932,
    pixelRatio: 3,
    frame: { color: '#1d1d1f', borderRadius: 60, padding: 16, dynamicIsland: true },
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 393,
    height: 852,
    pixelRatio: 3,
    frame: { color: '#1d1d1f', borderRadius: 56, padding: 16, dynamicIsland: true },
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 390,
    height: 844,
    pixelRatio: 3,
    frame: { color: '#f5f5f7', borderRadius: 50, padding: 14, dynamicIsland: true },
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 375,
    height: 667,
    pixelRatio: 2,
    frame: { color: '#f5f5f7', borderRadius: 36, padding: 12, homeButton: true },
  },
  {
    id: 'pixel-8-pro',
    name: 'Pixel 8 Pro',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 412,
    height: 892,
    pixelRatio: 3,
    frame: { color: '#2d2d2d', borderRadius: 40, padding: 12 },
  },
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 412,
    height: 915,
    pixelRatio: 3,
    frame: { color: '#1d1d1f', borderRadius: 36, padding: 10 },
  },
  {
    id: 'galaxy-z-fold',
    name: 'Galaxy Z Fold 5',
    category: 'mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: 904,
    height: 1080,
    pixelRatio: 3,
    frame: { color: '#1d1d1f', borderRadius: 24, padding: 8 },
  },
  // Wearables
  {
    id: 'apple-watch-ultra',
    name: 'Apple Watch Ultra',
    category: 'wearable',
    icon: <Watch className="w-4 h-4" />,
    width: 184,
    height: 224,
    pixelRatio: 2,
    frame: { color: '#e5a00d', borderRadius: 40, padding: 8 },
  },
  {
    id: 'apple-watch-9',
    name: 'Apple Watch Series 9',
    category: 'wearable',
    icon: <Watch className="w-4 h-4" />,
    width: 176,
    height: 198,
    pixelRatio: 2,
    frame: { color: '#1d1d1f', borderRadius: 36, padding: 8 },
  },
  // TV
  {
    id: 'apple-tv',
    name: 'Apple TV 4K',
    category: 'tv',
    icon: <Tv className="w-4 h-4" />,
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    frame: { color: '#1d1d1f', borderRadius: 8, padding: 24 },
  },
  {
    id: 'android-tv',
    name: 'Android TV',
    category: 'tv',
    icon: <Tv className="w-4 h-4" />,
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    frame: { color: '#2d2d2d', borderRadius: 8, padding: 24 },
  },
]

const categories = [
  { id: 'all', name: 'All Devices', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'desktop', name: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
  { id: 'laptop', name: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
  { id: 'tablet', name: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
  { id: 'mobile', name: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'wearable', name: 'Wearable', icon: <Watch className="w-4 h-4" /> },
  { id: 'tv', name: 'TV', icon: <Tv className="w-4 h-4" /> },
]

export default function DevicePreview({
  content,
  title,
  className,
  onClose,
  postSettings = {
    showHeader: true,
    showFooter: true,
    showSidebar: true,
    sidebarPosition: 'right',
    sidebarId: null,
  },
  featuredImage,
  author = 'Admin',
  publishDate,
  categories = [],
}: DevicePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState(devices.find(d => d.id === 'iphone-15-pro') || devices[0])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLandscape, setIsLandscape] = useState(false)
  const [zoom, setZoom] = useState(100)  // Default to 100% for clearer preview
  const [showDeviceFrame, setShowDeviceFrame] = useState(true)
  const [compareMode, setCompareMode] = useState(false)
  const [compareDevice, setCompareDevice] = useState<Device | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [autoFit, setAutoFit] = useState(true)  // Auto-fit to container
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Theme and layout settings
  const [themeData, setThemeData] = useState<ThemeData | null>(null)
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null)
  const [localPostSettings, setLocalPostSettings] = useState<PostSettings>(postSettings)
  const [availableSidebars, setAvailableSidebars] = useState<SidebarData[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const reportContainerRef = useRef<HTMLDivElement>(null)

  // Fetch theme and sidebar data
  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch active theme
        const themeResponse = await fetch('/api/v1/themes/active', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (themeResponse.ok) {
          const themeResult = await themeResponse.json();
          setThemeData(themeResult.data);
        }

        // Fetch available sidebars
        const sidebarsResponse = await fetch('/api/v1/sidebars', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (sidebarsResponse.ok) {
          const sidebarsResult = await sidebarsResponse.json();
          const sidebars = sidebarsResult.data || sidebarsResult || [];
          setAvailableSidebars(
            Array.isArray(sidebars) ? sidebars : []
          );

          // If a sidebar ID is set, fetch its data
          if (localPostSettings.sidebarId) {
            const selectedSidebar = sidebars.find((s: SidebarData) => s.id === localPostSettings.sidebarId);
            if (selectedSidebar) {
              setSidebarData(selectedSidebar);
            }
          }
        }
      } catch (err) {
        console.log('Could not fetch theme/sidebar data, using defaults');
      }
    };

    fetchThemeData();
  }, [localPostSettings.sidebarId]);

  // Update local settings when props change
  useEffect(() => {
    setLocalPostSettings(postSettings);
  }, [postSettings]);

  const filteredDevices = useMemo(() => {
    if (selectedCategory === 'all') return devices
    return devices.filter(d => d.category === selectedCategory)
  }, [selectedCategory])

  // Calculate the best fit zoom based on container size
  const getAutoFitZoom = (device: Device) => {
    if (!containerRef.current || !autoFit) return zoom / 100
    const containerWidth = containerRef.current.clientWidth - 64 // padding
    const containerHeight = containerRef.current.clientHeight - 64
    const deviceWidth = isLandscape ? device.height : device.width
    const deviceHeight = isLandscape ? device.width : device.height

    // Calculate scale to fit within container
    const scaleX = containerWidth / (deviceWidth + (showDeviceFrame ? 80 : 0))
    const scaleY = containerHeight / (deviceHeight + (showDeviceFrame ? 80 : 0))
    const fitScale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

    return Math.max(0.2, fitScale) // Minimum 20% zoom
  }

  const getDeviceDimensions = (device: Device) => {
    const width = isLandscape ? device.height : device.width
    const height = isLandscape ? device.width : device.height
    const scale = autoFit ? getAutoFitZoom(device) : zoom / 100
    return {
      width: width,
      height: height,
      scale: scale,
      scaledWidth: width * scale,
      scaledHeight: height * scale,
      originalWidth: width,
      originalHeight: height,
    }
  }

  // Generate PDF report showing page on different devices
  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true)

    try {
      // Create a hidden container for rendering device previews
      const hiddenContainer = document.createElement('div')
      hiddenContainer.style.position = 'absolute'
      hiddenContainer.style.left = '-9999px'
      hiddenContainer.style.top = '0'
      hiddenContainer.style.background = '#ffffff'
      document.body.appendChild(hiddenContainer)

      // Representative devices for the report (one from each category)
      const reportDevices = [
        devices.find(d => d.id === 'imac-27'),      // Desktop
        devices.find(d => d.id === 'macbook-pro-16'), // Laptop
        devices.find(d => d.id === 'ipad-pro-12'),  // Tablet
        devices.find(d => d.id === 'iphone-15-pro'), // Mobile
      ].filter(Boolean) as Device[]

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15

      // Title page
      pdf.setFontSize(24)
      pdf.setTextColor(59, 130, 246) // Blue
      pdf.text('Device Preview Report', pageWidth / 2, 40, { align: 'center' })

      pdf.setFontSize(16)
      pdf.setTextColor(31, 41, 55) // Gray-800
      pdf.text(title || 'Untitled Post', pageWidth / 2, 55, { align: 'center' })

      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128) // Gray-500
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 65, { align: 'center' })

      // Device list
      pdf.setFontSize(12)
      pdf.setTextColor(31, 41, 55)
      pdf.text('Devices included in this report:', margin, 85)

      reportDevices.forEach((device, index) => {
        pdf.setFontSize(10)
        pdf.setTextColor(107, 114, 128)
        pdf.text(`• ${device.name} (${device.width} × ${device.height})`, margin + 5, 95 + (index * 7))
      })

      // Generate preview for each device
      for (let i = 0; i < reportDevices.length; i++) {
        const device = reportDevices[i]
        pdf.addPage()

        // Device header
        pdf.setFontSize(18)
        pdf.setTextColor(31, 41, 55)
        pdf.text(device.name, margin, 20)

        pdf.setFontSize(10)
        pdf.setTextColor(107, 114, 128)
        pdf.text(`Resolution: ${device.width} × ${device.height} @ ${device.pixelRatio || 1}x`, margin, 28)
        pdf.text(`Category: ${device.category.charAt(0).toUpperCase() + device.category.slice(1)}`, margin, 34)

        // Create iframe for this device
        const iframe = document.createElement('iframe')
        const isMobile = device.category === 'mobile' || device.category === 'wearable'
        const isTablet = device.category === 'tablet'

        // Scale down for capturing (max 800px wide)
        const scale = Math.min(800 / device.width, 1)
        const captureWidth = device.width * scale
        const captureHeight = device.height * scale

        iframe.style.width = `${captureWidth}px`
        iframe.style.height = `${captureHeight}px`
        iframe.style.border = 'none'
        iframe.style.background = '#ffffff'

        hiddenContainer.innerHTML = ''
        hiddenContainer.appendChild(iframe)

        // Generate device-specific HTML
        const previewHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: ${isMobile ? '14px' : '16px'};
                line-height: 1.6;
                color: #1F2937;
                background: #ffffff;
              }
              .header {
                padding: ${isMobile ? '12px 16px' : '16px 24px'};
                border-bottom: 1px solid #E5E7EB;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              .logo {
                font-weight: 800;
                font-size: ${isMobile ? '18px' : '24px'};
                background: linear-gradient(135deg, #3B82F6, #10B981);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .nav { display: ${isMobile ? 'none' : 'flex'}; gap: 16px; }
              .nav a { color: #4B5563; text-decoration: none; font-size: 14px; }
              .content { padding: ${isMobile ? '16px' : isTablet ? '24px' : '32px'}; max-width: 800px; margin: 0 auto; }
              .title {
                font-size: ${isMobile ? '24px' : isTablet ? '32px' : '40px'};
                font-weight: 800;
                margin-bottom: 16px;
                line-height: 1.2;
              }
              .meta {
                color: #6B7280;
                font-size: 12px;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #E5E7EB;
              }
              .post-content { font-size: ${isMobile ? '14px' : '16px'}; }
              .post-content p { margin-bottom: 16px; }
              .post-content h1, .post-content h2, .post-content h3 {
                font-weight: 700;
                margin: 24px 0 12px;
              }
              .post-content h1 { font-size: 1.75em; }
              .post-content h2 { font-size: 1.5em; }
              .post-content h3 { font-size: 1.25em; }
              .footer {
                background: #1F2937;
                color: #9CA3AF;
                padding: ${isMobile ? '24px 16px' : '32px 24px'};
                margin-top: 32px;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <header class="header">
              <div class="logo">RustPress</div>
              <nav class="nav">
                <a href="#">Home</a>
                <a href="#">Blog</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
              </nav>
              ${isMobile ? '<button style="background:none;border:none;font-size:24px;">☰</button>' : ''}
            </header>
            <main class="content">
              <h1 class="title">${title || 'Untitled Post'}</h1>
              <div class="meta">
                <span>By Admin</span> •
                <span>${new Date().toLocaleDateString()}</span> •
                <span>3 min read</span>
              </div>
              <div class="post-content">
                ${content || '<p>Your post content will appear here...</p>'}
              </div>
            </main>
            <footer class="footer">
              <p>© ${new Date().getFullYear()} RustPress. All rights reserved.</p>
            </footer>
          </body>
          </html>
        `

        iframe.srcdoc = previewHTML

        // Wait for iframe to load
        await new Promise(resolve => {
          iframe.onload = () => setTimeout(resolve, 500)
        })

        // Capture the iframe content
        try {
          const canvas = await html2canvas(iframe.contentDocument?.body || iframe, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: captureWidth,
            height: Math.min(captureHeight, 1200), // Limit height for very tall pages
          })

          // Calculate image dimensions to fit on page
          const imgWidth = pageWidth - (margin * 2)
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          const maxImgHeight = pageHeight - 50 // Leave room for header

          const finalImgHeight = Math.min(imgHeight, maxImgHeight)
          const finalImgWidth = (finalImgHeight === maxImgHeight)
            ? (canvas.width * maxImgHeight) / canvas.height
            : imgWidth

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png')
          pdf.addImage(
            imgData,
            'PNG',
            margin + (imgWidth - finalImgWidth) / 2,
            45,
            finalImgWidth,
            finalImgHeight
          )
        } catch (err) {
          console.error('Failed to capture device preview:', err)
          pdf.setFontSize(12)
          pdf.setTextColor(239, 68, 68)
          pdf.text('Failed to capture preview for this device', margin, 50)
        }
      }

      // Clean up
      document.body.removeChild(hiddenContainer)

      // Save the PDF
      pdf.save(`${(title || 'preview').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-device-report.pdf`)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }, [content, title])

  const generatePreviewHTML = () => {
    const isMobile = selectedDevice.category === 'mobile' || selectedDevice.category === 'wearable'
    const isTablet = selectedDevice.category === 'tablet'
    const showHeader = localPostSettings.showHeader !== false
    const showFooter = localPostSettings.showFooter !== false
    const showSidebar = localPostSettings.showSidebar && !isMobile // Hide sidebar on mobile
    const sidebarPosition = localPostSettings.sidebarPosition || 'right'
    const themeName = themeData?.name || 'RustPress'

    // Generate sidebar HTML based on selected sidebar data
    const generateSidebarHTML = () => {
      if (!showSidebar) return ''

      const sidebarName = sidebarData?.name || 'Blog Sidebar'
      const widgets = sidebarData?.widgets || [
        { type: 'search', title: 'Search' },
        { type: 'categories', title: 'Categories' },
        { type: 'recent_posts', title: 'Recent Posts' },
        { type: 'tags', title: 'Tags' },
      ]

      const widgetHTML = widgets.map(widget => {
        switch (widget.type) {
          case 'search':
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Search'}</h4>
                <div class="search-form">
                  <input type="text" placeholder="Search..." class="search-input" />
                  <button class="search-btn">🔍</button>
                </div>
              </div>
            `
          case 'categories':
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Categories'}</h4>
                <ul class="widget-list">
                  <li><a href="#">Technology</a> <span class="count">(12)</span></li>
                  <li><a href="#">Lifestyle</a> <span class="count">(8)</span></li>
                  <li><a href="#">Travel</a> <span class="count">(5)</span></li>
                  <li><a href="#">Business</a> <span class="count">(3)</span></li>
                </ul>
              </div>
            `
          case 'recent_posts':
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Recent Posts'}</h4>
                <ul class="recent-posts">
                  <li><a href="#">Getting Started with RustPress</a><span class="date">Jan 15, 2024</span></li>
                  <li><a href="#">10 Tips for Better Blogging</a><span class="date">Jan 12, 2024</span></li>
                  <li><a href="#">Theme Customization Guide</a><span class="date">Jan 10, 2024</span></li>
                </ul>
              </div>
            `
          case 'tags':
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Tags'}</h4>
                <div class="tag-cloud">
                  <a href="#" class="tag">rust</a>
                  <a href="#" class="tag">cms</a>
                  <a href="#" class="tag">web</a>
                  <a href="#" class="tag">development</a>
                  <a href="#" class="tag">tutorial</a>
                </div>
              </div>
            `
          case 'newsletter':
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Newsletter'}</h4>
                <p class="widget-desc">Subscribe to get the latest updates.</p>
                <input type="email" placeholder="Your email..." class="newsletter-input" />
                <button class="newsletter-btn">Subscribe</button>
              </div>
            `
          default:
            return `
              <div class="sidebar-widget">
                <h4 class="widget-title">${widget.title || 'Widget'}</h4>
                <p>${widget.content || 'Widget content'}</p>
              </div>
            `
        }
      }).join('')

      return `
        <aside class="site-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-name">${sidebarName}</span>
          </div>
          ${widgetHTML}
        </aside>
      `
    }

    // Calculate reading time
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    const displayDate = publishDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const categoryBadges = categories.length > 0 ? categories : ['Technology']

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --color-primary: #3B82F6;
            --color-primary-dark: #1D4ED8;
            --color-secondary: #10B981;
            --color-accent: #F59E0B;
            --color-text: #1F2937;
            --color-text-light: #6B7280;
            --color-bg: #FFFFFF;
            --color-bg-alt: #F9FAFB;
            --color-border: #E5E7EB;
            --font-heading: 'Inter', system-ui, sans-serif;
            --font-body: 'Inter', system-ui, sans-serif;
            --radius-sm: 0.375rem;
            --radius-md: 0.5rem;
            --radius-lg: 0.75rem;
            --sidebar-width: ${isTablet ? '240px' : '300px'};
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: var(--font-body);
            line-height: 1.6;
            color: var(--color-text);
            background: var(--color-bg);
          }

          /* Header */
          .site-header {
            background: var(--color-bg);
            border-bottom: 1px solid var(--color-border);
            padding: ${isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem'};
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1400px;
            margin: 0 auto;
          }
          .site-logo {
            font-family: var(--font-heading);
            font-size: ${isMobile ? '1rem' : '1.25rem'};
            font-weight: 800;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .nav-menu {
            display: ${isMobile ? 'none' : 'flex'};
            list-style: none;
            gap: 0.5rem;
          }
          .nav-menu a {
            color: var(--color-text);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-sm);
          }
          .nav-menu a:hover { background: var(--color-bg-alt); }
          .nav-menu .current a { background: var(--color-primary); color: white; }
          .mobile-menu-btn {
            display: ${isMobile ? 'block' : 'none'};
            background: none;
            border: none;
            padding: 0.5rem;
            cursor: pointer;
            font-size: 1.5rem;
          }

          /* Main Layout with Sidebar */
          .site-main {
            display: ${showSidebar ? 'grid' : 'block'};
            ${showSidebar ? `grid-template-columns: ${sidebarPosition === 'left' ? 'var(--sidebar-width) 1fr' : '1fr var(--sidebar-width)'};` : ''}
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            padding: ${isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem'};
          }

          /* Sidebar */
          .site-sidebar {
            ${showSidebar ? '' : 'display: none;'}
            ${sidebarPosition === 'left' ? 'order: -1;' : ''}
          }
          .sidebar-header {
            padding: 0.75rem 1rem;
            background: var(--color-bg-alt);
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
          }
          .sidebar-name {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--color-text-light);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .sidebar-widget {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: 1rem;
            margin-bottom: 1rem;
          }
          .widget-title {
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--color-text);
          }
          .widget-list { list-style: none; }
          .widget-list li {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--color-border);
            font-size: 0.875rem;
          }
          .widget-list li:last-child { border: none; }
          .widget-list a { color: var(--color-text); text-decoration: none; }
          .widget-list a:hover { color: var(--color-primary); }
          .widget-list .count { color: var(--color-text-light); font-size: 0.75rem; }
          .recent-posts { list-style: none; }
          .recent-posts li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--color-border);
          }
          .recent-posts li:last-child { border: none; }
          .recent-posts a { color: var(--color-text); text-decoration: none; font-size: 0.875rem; display: block; }
          .recent-posts a:hover { color: var(--color-primary); }
          .recent-posts .date { font-size: 0.75rem; color: var(--color-text-light); display: block; margin-top: 0.25rem; }
          .tag-cloud { display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .tag {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: var(--color-bg-alt);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            color: var(--color-text);
            text-decoration: none;
          }
          .tag:hover { background: var(--color-primary); color: white; }
          .search-form { display: flex; gap: 0.5rem; }
          .search-input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
          }
          .search-btn {
            padding: 0.5rem 0.75rem;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
          }
          .widget-desc { font-size: 0.875rem; color: var(--color-text-light); margin-bottom: 0.75rem; }
          .newsletter-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          .newsletter-btn {
            width: 100%;
            padding: 0.5rem;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-weight: 500;
          }

          /* Post Content Area */
          .site-content {
            max-width: ${showSidebar ? '100%' : '800px'};
            margin: ${showSidebar ? '0' : '0 auto'};
          }

          /* Breadcrumbs */
          .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--color-text-light);
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--color-border);
          }
          .breadcrumbs a { color: var(--color-primary); text-decoration: none; }

          /* Post Header */
          .post-header { margin-bottom: 1.5rem; }
          .category-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
          .category-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
            color: white;
            font-size: 0.625rem;
            font-weight: 600;
            text-transform: uppercase;
            border-radius: var(--radius-sm);
          }
          .post-title {
            font-family: var(--font-heading);
            font-size: ${isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem'};
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 1rem;
          }
          .post-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.75rem;
            color: var(--color-text-light);
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--color-border);
          }
          .meta-item { display: flex; align-items: center; gap: 0.25rem; }
          .author-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.625rem;
            font-weight: 600;
          }

          /* Featured Image */
          .featured-image {
            margin: 1.5rem 0;
            border-radius: var(--radius-lg);
            overflow: hidden;
          }
          .featured-image img { width: 100%; height: auto; display: block; }
          .featured-placeholder {
            height: ${isMobile ? '150px' : '250px'};
            background: linear-gradient(135deg, var(--color-bg-alt), var(--color-border));
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-light);
            font-size: 0.75rem;
          }

          /* Post Content */
          .post-content {
            font-size: ${isMobile ? '0.875rem' : '1rem'};
            line-height: 1.8;
          }
          .post-content p { margin-bottom: 1rem; }
          .post-content h1, .post-content h2, .post-content h3 {
            font-family: var(--font-heading);
            font-weight: 700;
            margin: 1.5rem 0 0.75rem;
          }
          .post-content h1 { font-size: 1.75rem; }
          .post-content h2 { font-size: 1.5rem; border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; }
          .post-content h3 { font-size: 1.25rem; }
          .post-content a { color: var(--color-primary); }
          .post-content img { max-width: 100%; border-radius: var(--radius-md); margin: 1rem 0; }
          .post-content blockquote {
            border-left: 4px solid var(--color-primary);
            padding: 0.75rem 1rem;
            margin: 1rem 0;
            background: var(--color-bg-alt);
            font-style: italic;
          }
          .post-content pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 1rem;
            border-radius: var(--radius-md);
            overflow-x: auto;
            font-size: 0.75rem;
          }
          .post-content code {
            background: var(--color-bg-alt);
            padding: 0.125rem 0.25rem;
            border-radius: var(--radius-sm);
            font-size: 0.85em;
          }
          .post-content ul, .post-content ol { margin: 1rem 0; padding-left: 1.5rem; }

          /* Author Box */
          .author-box {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            background: var(--color-bg-alt);
            border-radius: var(--radius-lg);
            margin: 2rem 0;
          }
          .author-box-avatar {
            width: ${isMobile ? '48px' : '64px'};
            height: ${isMobile ? '48px' : '64px'};
            border-radius: 50%;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            flex-shrink: 0;
          }
          .author-box-info h4 { font-size: 1rem; margin-bottom: 0.25rem; }
          .author-box-info p { font-size: 0.75rem; color: var(--color-text-light); }

          /* Footer */
          .site-footer {
            background: #1F2937;
            color: #9CA3AF;
            margin-top: 2rem;
          }
          .footer-main {
            padding: ${isMobile ? '1.5rem 1rem' : '2rem 1.5rem'};
            max-width: 1400px;
            margin: 0 auto;
          }
          .footer-widgets {
            display: grid;
            grid-template-columns: ${isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'};
            gap: 1.5rem;
          }
          .footer-widget h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.75rem;
          }
          .footer-widget p { font-size: 0.75rem; line-height: 1.6; }
          .footer-widget ul { list-style: none; }
          .footer-widget li { margin-bottom: 0.25rem; }
          .footer-widget a { color: #9CA3AF; text-decoration: none; font-size: 0.75rem; }
          .footer-widget a:hover { color: white; }
          .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding: 1rem ${isMobile ? '1rem' : '1.5rem'};
            display: flex;
            ${isMobile ? 'flex-direction: column; gap: 0.5rem;' : 'justify-content: space-between;'}
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
            font-size: 0.75rem;
          }
          .footer-nav { display: flex; gap: 1rem; }
          .footer-nav a { color: #9CA3AF; text-decoration: none; }

          /* Theme custom styles */
          ${themeData?.styles_css || ''}
        </style>
      </head>
      <body>
        ${showHeader ? `
        <!-- Header -->
        <header class="site-header">
          <div class="header-inner">
            <div class="site-logo">${themeName}</div>
            <nav>
              <ul class="nav-menu">
                <li><a href="#">Home</a></li>
                <li class="current"><a href="#">Blog</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Shop</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </nav>
            <button class="mobile-menu-btn">☰</button>
          </div>
        </header>
        ` : ''}

        <!-- Main Layout -->
        <div class="site-main">
          ${sidebarPosition === 'left' ? generateSidebarHTML() : ''}

          <!-- Post Content Area -->
          <main class="site-content">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs">
              <a href="#">Home</a> / <a href="#">Blog</a> / <span>${title || 'Untitled Post'}</span>
            </nav>

            <!-- Post Header -->
            <header class="post-header">
              <div class="category-badges">
                ${categoryBadges.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
              </div>
              <h1 class="post-title">${title || 'Untitled Post'}</h1>
              <div class="post-meta">
                <div class="meta-item">
                  <div class="author-avatar">${author.charAt(0).toUpperCase()}</div>
                  <span>${author}</span>
                </div>
                <div class="meta-item">📅 ${displayDate}</div>
                <div class="meta-item">⏱ ${readingTime} min read</div>
              </div>
            </header>

            <!-- Featured Image -->
            <div class="featured-image">
              ${featuredImage?.url
                ? `<img src="${featuredImage.url}" alt="${featuredImage.alt || title || ''}" />`
                : '<div class="featured-placeholder">Featured Image</div>'
              }
            </div>

            <!-- Post Content -->
            <div class="post-content">
              ${content || '<p>Your post content will appear here...</p>'}
            </div>

            <!-- Author Box -->
            <div class="author-box">
              <div class="author-box-avatar">${author.charAt(0).toUpperCase()}</div>
              <div class="author-box-info">
                <h4>Written by ${author}</h4>
                <p>Site author and content creator. Passionate about sharing knowledge.</p>
              </div>
            </div>
          </main>

          ${sidebarPosition === 'right' ? generateSidebarHTML() : ''}
        </div>

        ${showFooter ? `
        <!-- Footer -->
        <footer class="site-footer">
          <div class="footer-main">
            <div class="footer-widgets">
              <div class="footer-widget">
                <h3>${themeName}</h3>
                <p>A modern developer-focused CMS built with Rust.</p>
              </div>
              <div class="footer-widget">
                <h3>Quick Links</h3>
                <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div class="footer-widget">
                <h3>Categories</h3>
                <ul>
                  <li><a href="#">Technology</a></li>
                  <li><a href="#">Lifestyle</a></li>
                  <li><a href="#">Travel</a></li>
                </ul>
              </div>
              <div class="footer-widget">
                <h3>Newsletter</h3>
                <p>Subscribe for updates.</p>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} ${themeName}. All rights reserved.</p>
            <nav class="footer-nav">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </nav>
          </div>
        </footer>
        ` : ''}
      </body>
      </html>
    `
  }

  const renderDevice = (device: Device, isCompare = false) => {
    const dims = getDeviceDimensions(device)
    const frame = device.frame
    const scale = dims.scale

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="font-medium text-gray-900 dark:text-white">{device.name}</h3>
          <p className="text-sm text-gray-500">
            {dims.originalWidth} × {dims.originalHeight}
            {device.pixelRatio && ` @${device.pixelRatio}x`}
            <span className="ml-2 text-xs text-gray-400">({Math.round(scale * 100)}%)</span>
          </p>
        </div>

        {/* Device Frame Container - scales the entire device */}
        <div
          style={{
            width: dims.scaledWidth + (showDeviceFrame ? (frame?.padding || 0) * 2 * scale : 0),
            height: dims.scaledHeight + (showDeviceFrame ? (frame?.padding || 0) * 2 * scale : 0),
          }}
        >
          <motion.div
            layout
            className={clsx(
              'relative transition-all duration-300 origin-top-left',
              showDeviceFrame && 'shadow-2xl'
            )}
            style={{
              backgroundColor: showDeviceFrame ? frame?.color : 'transparent',
              borderRadius: showDeviceFrame ? (frame?.borderRadius || 0) * scale : 0,
              padding: showDeviceFrame ? (frame?.padding || 0) * scale : 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: dims.width + (showDeviceFrame ? (frame?.padding || 0) * 2 : 0),
              height: dims.height + (showDeviceFrame ? (frame?.padding || 0) * 2 : 0),
            }}
          >
            {/* Dynamic Island (iPhone 14 Pro+) */}
            {showDeviceFrame && frame?.dynamicIsland && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-10"
                style={{
                  width: dims.width * 0.25,
                  height: 28,
                }}
              />
            )}

            {/* Notch (MacBook) */}
            {showDeviceFrame && frame?.notch && device.category === 'laptop' && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-lg z-10"
                style={{
                  width: dims.width * 0.12,
                  height: 24,
                }}
              />
            )}

            {/* Home Button */}
            {showDeviceFrame && frame?.homeButton && (
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-gray-400"
                style={{
                  width: device.category === 'mobile' ? 40 : 50,
                  height: device.category === 'mobile' ? 40 : 50,
                }}
              />
            )}

            {/* The actual iframe at full device resolution */}
            <iframe
              srcDoc={generatePreviewHTML()}
              className="bg-white"
              style={{
                width: dims.width,
                height: dims.height,
                borderRadius: showDeviceFrame ? Math.max(0, (frame?.borderRadius || 0) - (frame?.padding || 0) / 2) : 8,
                border: showDeviceFrame ? 'none' : '1px solid #e5e7eb',
              }}
              title={`Preview on ${device.name}`}
            />
          </motion.div>
        </div>
      </div>
    )
  }

  const deviceIndex = filteredDevices.findIndex(d => d.id === selectedDevice.id)

  const handlePrevDevice = () => {
    const newIndex = deviceIndex > 0 ? deviceIndex - 1 : filteredDevices.length - 1
    setSelectedDevice(filteredDevices[newIndex])
  }

  const handleNextDevice = () => {
    const newIndex = deviceIndex < filteredDevices.length - 1 ? deviceIndex + 1 : 0
    setSelectedDevice(filteredDevices[newIndex])
  }

  return (
    <div className={clsx('flex flex-col h-full bg-gray-100 dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Device Preview</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Report Button */}
          <button
            onClick={generateReport}
            disabled={isGeneratingReport}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isGeneratingReport
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create Report
              </>
            )}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setZoom(Math.max(10, zoom - 10))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(100, zoom + 10))}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotation */}
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isLandscape
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Toggle orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Frame Toggle */}
          <button
            onClick={() => setShowDeviceFrame(!showDeviceFrame)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showDeviceFrame
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Toggle device frame"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Compare Mode */}
          <button
            onClick={() => {
              setCompareMode(!compareMode)
              if (!compareMode && !compareDevice) {
                const otherDevice = devices.find(d => d.category !== selectedDevice.category)
                if (otherDevice) setCompareDevice(otherDevice)
              }
            }}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              compareMode
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Compare devices"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Settings className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
              selectedCategory === cat.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Device Selector */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={handlePrevDevice}
          className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {filteredDevices.map(device => (
          <button
            key={device.id}
            onClick={() => setSelectedDevice(device)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
              selectedDevice.id === device.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            {device.icon}
            {device.name}
          </button>
        ))}

        <button
          onClick={handleNextDevice}
          className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8"
      >
        <div className={clsx(
          'flex items-start justify-center gap-8 min-h-full',
          compareMode && 'flex-wrap'
        )}>
          {renderDevice(selectedDevice)}

          {compareMode && compareDevice && (
            <>
              <div className="w-px h-96 bg-gray-300 dark:bg-gray-700 self-center" />
              <div className="relative">
                <select
                  value={compareDevice.id}
                  onChange={e => {
                    const device = devices.find(d => d.id === e.target.value)
                    if (device) setCompareDevice(device)
                  }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {renderDevice(compareDevice, true)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 grid grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Display Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoFit}
                      onChange={e => setAutoFit(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-fit to container</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showDeviceFrame}
                      onChange={e => setShowDeviceFrame(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show device frame</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={e => setCompareMode(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Compare mode</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Theme Layout</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localPostSettings.showHeader !== false}
                      onChange={e => setLocalPostSettings(prev => ({ ...prev, showHeader: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Header</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localPostSettings.showFooter !== false}
                      onChange={e => setLocalPostSettings(prev => ({ ...prev, showFooter: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Footer</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localPostSettings.showSidebar || false}
                      onChange={e => setLocalPostSettings(prev => ({ ...prev, showSidebar: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Sidebar</span>
                  </label>
                  {localPostSettings.showSidebar && (
                    <div className="flex items-center gap-2 pl-6">
                      <button
                        onClick={() => setLocalPostSettings(prev => ({ ...prev, sidebarPosition: 'left' }))}
                        className={clsx(
                          'p-1.5 rounded',
                          localPostSettings.sidebarPosition === 'left'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                        title="Sidebar Left"
                      >
                        <PanelLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLocalPostSettings(prev => ({ ...prev, sidebarPosition: 'right' }))}
                        className={clsx(
                          'p-1.5 rounded',
                          localPostSettings.sidebarPosition === 'right'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                        title="Sidebar Right"
                      >
                        <PanelRight className="w-4 h-4" />
                      </button>
                      {availableSidebars.length > 0 && (
                        <select
                          value={localPostSettings.sidebarId || ''}
                          onChange={e => {
                            const sidebarId = e.target.value || null
                            setLocalPostSettings(prev => ({ ...prev, sidebarId }))
                            const selected = availableSidebars.find(s => s.id === sidebarId)
                            setSidebarData(selected || null)
                          }}
                          className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
                        >
                          <option value="">Default Sidebar</option>
                          {availableSidebars.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={autoFit ? 'opacity-50' : ''}>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                  Zoom Level {autoFit && <span className="text-xs text-gray-400">(auto)</span>}
                </h4>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={zoom}
                  onChange={e => { setAutoFit(false); setZoom(Number(e.target.value)); }}
                  className="w-full accent-primary-600"
                  disabled={autoFit}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20%</span>
                  <span>{autoFit ? 'Auto' : `${zoom}%`}</span>
                  <span>150%</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Download className="w-4 h-4" />
                    Screenshot
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
