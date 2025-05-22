import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

function CertificatePreview({ template, student, certRef }) {
  if (!template?.data) return null;
  const { items = [], certificateStyle = {} } = template.data;

  // Replace dynamic fields
  const renderedItems = items.map(item => {
    if (item.type === 'text' && item.idAttribute === 'name') {
      return { ...item, text: student.name };
    }
    return item;
  });

  const baseWidth = certificateStyle.width || 800;
  const baseHeight = certificateStyle.height || 600;

  // Responsive container: maintain aspect ratio, scale content
  const [scale, setScale] = React.useState(1);
  const containerRef = React.useRef();

  React.useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const parentHeight = containerRef.current.parentElement?.clientHeight || window.innerHeight;
        
        // Calculate scale based on both width and height constraints
        const widthScale = parentWidth / baseWidth;
        const heightScale = parentHeight / baseHeight;
        const newScale = Math.min(widthScale, heightScale, 1);
        
        setScale(newScale);
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [baseWidth, baseHeight]);

  // Certificate container style
  const containerStyle = {
    position: 'relative',
    width: baseWidth,
    height: baseHeight,
    background: certificateStyle.backgroundImage
      ? `url(${certificateStyle.backgroundImage}) ${certificateStyle.background || '#f9f5e8'}`
      : certificateStyle.background || '#f9f5e8',
    backgroundSize: certificateStyle.backgroundSize || 'cover',
    backgroundPosition: certificateStyle.backgroundPosition || 'center',
    backgroundRepeat: certificateStyle.backgroundRepeat || 'no-repeat',
    padding: certificateStyle.padding || 40,
    overflow: 'hidden',
    margin: '0 auto',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    borderRadius: 8,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  // Wrapper style for full viewport display
  const wrapperStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  };

  // Helper for dynamic font size for name field
  function getNameFontSize(name, baseFontSize, maxWidth) {
    if (!name) return baseFontSize;
    let fontSize = baseFontSize;
    if (name.length > 22) fontSize = Math.max(baseFontSize - 6, 16);
    if (name.length > 32) fontSize = Math.max(baseFontSize - 12, 12);
    return fontSize;
  }

  // Render each element (read-only, no editing, no drag/drop)
  const renderElement = (el) => {
    const isNameField = el.type === 'text' && el.idAttribute === 'name';
    let style = {
      position: 'absolute',
      left: el.x,
      top: el.y,
      width: typeof el.width === 'number' ? el.width : el.width,
      height: typeof el.height === 'number' ? el.height : el.height,
      zIndex: typeof el.zIndex === 'number' ? el.zIndex : 1,
      ...el.style,
    };
    if (isNameField) {
      const baseFontSize = el.style?.fontSize || 28;
      const fontSize = getNameFontSize(student.name, baseFontSize, style.width);
      style = {
        ...style,
        wordBreak: 'break-word',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'pre-line',
        fontSize: fontSize * scale,
        maxWidth: style.width || '100%',
        textAlign: 'center',
        left: '50%',
        transform: `translateX(-50%)`,
      };
    }
    switch (el.type) {
      case 'text':
        return (
          <div key={el.id} style={style} className={el.className || ''} id={el.idAttribute || undefined}>
            {el.text}
          </div>
        );
      case 'image':
        return el.src ? (
          <img key={el.id} src={el.src} alt={el.alt || ''} style={{ ...style, objectFit: 'contain' }} className={el.className || ''} />
        ) : null;
      case 'border':
        return <div key={el.id} style={style} className={el.className || ''} />;
      case 'decoration':
        return el.src ? (
          <img key={el.id} src={el.src} alt="Decoration" style={{ ...style, opacity: el.style?.opacity || 0.7, mixBlendMode: el.style?.blendMode || 'normal', objectFit: 'contain' }} className={el.className || ''} />
        ) : null;
      case 'shape':
        let shapeStyle = { ...style };
        if (el.shape === 'circle') shapeStyle.borderRadius = '50%';
        if (el.shape === 'triangle') shapeStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        if (el.shape === 'diamond') shapeStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        if (el.shape === 'star') shapeStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        return <div key={el.id} style={shapeStyle} className={el.className || ''} />;
      case 'watermark':
        return el.src ? (
          <img key={el.id} src={el.src} alt="Watermark" style={{ ...style, opacity: el.style?.opacity ?? 0.2, mixBlendMode: el.style?.blendMode || 'multiply', objectFit: 'contain', transform: `rotate(${el.style?.rotation || 0}deg)` }} className={el.className || ''} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div style={wrapperStyle} ref={containerRef}>
      <div style={{...containerStyle, margin: 0}} ref={certRef}>
        {renderedItems.map(renderElement)}
      </div>
    </div>
  );
}

export default function CertificatePage() {
  const { number: hash } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const certRef = React.useRef();

  useEffect(() => {
    // Fetch by hash
    axios.get(`https://certificat-backend.onrender.com/api/client/certificate/${hash}`)
      .then(res => setStudent(res.data))
      .catch(() => setError('Certificate not found'));
  }, [hash]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    // Use html2canvas to capture the certificate
    const canvas = await html2canvas(certRef.current, { 
      useCORS: true, 
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      windowWidth: certRef.current.scrollWidth,
      windowHeight: certRef.current.scrollHeight
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: (canvas.width > canvas.height) ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${student.template.name}.pdf`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-red-600 text-lg">{error}</div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/')}>Back Home</button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-0 m-0 w-full">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Certificate</h1>
      </div>
      <div className="flex-1 w-full flex items-center justify-center p-0 m-0">
        <CertificatePreview template={student.template} student={student} certRef={certRef} />
      </div>
      <div className="flex gap-4 my-4">
        <button className="px-4 py-2 bg-gray-500 text-white rounded flex items-center gap-2" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
}