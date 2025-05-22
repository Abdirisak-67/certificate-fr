import React, { useState, useRef, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import { ChromePicker } from 'react-color';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaFileUpload, FaEye } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { MdTextFields, MdDelete } from 'react-icons/md';
import { Rnd } from 'react-rnd';

const FONT_FAMILIES = [
  { name: 'Times New Roman', value: "'Times New Roman', serif" },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
  { name: 'Palatino', value: 'Palatino, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { name: 'Lucida Console', value: "'Lucida Console', monospace" },
  { name: 'Brush Script', value: "'Brush Script MT', cursive" },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Lobster', value: 'Lobster, cursive' },
];

const DEFAULT_STYLES = {
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    lineHeight: 1.2,
    fontFamily: 'Montserrat, sans-serif',
    textShadow: '0 2px 8px #00000022',
    letterSpacing: '1px',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    padding: '0',
  },
};

const DEFAULT_CERTIFICATE = {
  width: 900,
  height: 650,
  background: '#fffbe9',
  padding: 40,
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const ELEMENTS = [
  { type: 'text', label: 'Text', icon: <MdTextFields /> }
];

export default function TemplateEditor({ templateId, onSave }) {
  const [form, setForm] = useState({
    name: '',
    data: {
      items: [],
      certificateStyle: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [certificateStyle, setCertificateStyle] = useState(form.data.certificateStyle || DEFAULT_CERTIFICATE);
  const certificateRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null); // Track the selected element ID
  const [showNameModal, setShowNameModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Ensure certificateStyle is always in sync with form.data.certificateStyle
  useEffect(() => {
    setCertificateStyle(form.data.certificateStyle || DEFAULT_CERTIFICATE);
  }, [form.data.certificateStyle]);

  const fetchTemplate = async () => {
    try {
      const res = await axios.get(`https://certificat-backend.onrender.com/api/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setForm(res.data);
      setCertificateStyle(res.data.data.certificateStyle || DEFAULT_CERTIFICATE);
      setTemplateNameInput(res.data.name || ""); // Set name input for editing
    } catch (err) {
      console.error('Error fetching template:', err);
      setMessage('Error loading template');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (templateId) {
        await axios.put(`https://certificat-backend.onrender.com/api/templates/${templateId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessage('Template updated successfully!');
      } else {
        await axios.post('https://certificat-backend.onrender.com/api/templates', form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessage('Template created successfully!');
      }
      if (onSave) onSave();
    } catch (err) {
      console.error('Error saving template:', err);
      setMessage('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const addElement = (type) => {
    if (type === 'text') {
      const newId = `textbox-${Date.now()}`;
      const newTextbox = {
        id: newId,
        type: 'text',
        text: 'Text',
        style: { ...DEFAULT_STYLES.text },
        x: 100,
        y: 100,
        width: 200,
        height: 'auto',
        idAttribute: '', // user can set this in sidebar, e.g. "name"
        placeholder: 'Enter text',
      };
      setForm(prev => ({
        ...prev,
        data: {
          ...prev.data,
          items: [...prev.data.items, newTextbox]
        }
      }));
      setSelectedId(newId);
    }
  };

  const deleteElement = (id) => {
    setForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        items: prev.data.items.filter(item => item.id !== id)
      }
    }));
    setSelectedId(null);
  };

  const handleDragStop = (id, d) => {
    setForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        items: prev.data.items.map(item =>
          item.id === id ? { ...item, x: d.x, y: d.y } : item
        )
      }
    }));
  };
  const handleResizeStop = (id, dir, ref, delta, pos) => {
    setForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        items: prev.data.items.map(item =>
          item.id === id
            ? { ...item, width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y }
            : item
        )
      }
    }));
  };

  // Fix handleDragStart to accept the event argument and set drag type
  const handleDragStart = (e, type) => {
    // Mark this as a sidebar drag
    e.dataTransfer.setData('drag-type', 'sidebar-text');
  };

  // Add a helper to get relative coordinates
  const getRelativeCoords = (event, ref) => {
    const rect = ref.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Update handleDrop to support sidebar drag
  const handleDrop = (e) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('drag-type');
    if (dragType === 'sidebar-text') {
      // Dropping a new text element from sidebar
      const coords = getRelativeCoords(e, certificateRef);
      const newId = `textbox-${Date.now()}`;
      const newTextbox = {
        id: newId,
        type: 'text',
        text: 'Text',
        style: { ...DEFAULT_STYLES.text },
        x: coords.x,
        y: coords.y,
        width: 200,
        height: 'auto',
        idAttribute: '',
        placeholder: 'Enter text',
      };
      setForm(prev => ({
        ...prev,
        data: {
          ...prev.data,
          items: [...prev.data.items, newTextbox]
        }
      }));
      setSelectedId(newId);
    } 
  };

  const handleTextChange = (index, value) => {
    const newItems = [...form.data.items];
    newItems[index] = { ...newItems[index], text: value };
    setForm(prev => ({
      ...prev,
      data: { ...prev.data, items: newItems }
    }));
  };

  const handleStyleChange = (index, style, value) => {
    const newItems = [...form.data.items];
    newItems[index] = {
      ...newItems[index],
      style: { ...newItems[index].style, [style]: value }
    };
    setForm(prev => ({
      ...prev,
      data: { ...prev.data, items: newItems }
    }));
  };

  const handleBackgroundImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately (before upload)
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          data: {
            ...prev.data,
            certificateStyle: {
              ...prev.data.certificateStyle,
              backgroundImage: ev.target.result // base64 preview
            }
          }
        }));
      };
      reader.readAsDataURL(file);

      // Optionally upload to server as before (keep this if you want to save to backend)
      // const formData = new FormData();
      // formData.append('image', file);
      // try {
      //   const res = await axios.post('/api/upload', formData, {
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //       Authorization: `Bearer ${localStorage.getItem('token')}`
      //     }
      //   });
      //   setForm(prev => ({
      //     ...prev,
      //     data: {
      //       ...prev.data,
      //       certificateStyle: {
      //         ...prev.data.certificateStyle,
      //         backgroundImage: res.data.url
      //       }
      //     }
      //   }));
      // } catch (err) {
      //   console.error('Error uploading image:', err);
      //   setMessage('Error uploading image');
      // }
    }
  };

  // Helper to run html2canvas with oklch color fix
  const runHtml2CanvasWithOklchFix = async (element) => {
    const style = document.createElement('style');
    style.id = 'html2canvas-oklch-fix';
    style.innerHTML = `
      [data-certificate-preview] *, [data-certificate-preview] {
        color: #222 !important;
        border-color: #ccc !important;
        box-shadow: none !important;
        text-shadow: none !important;
        /* DO NOT override background or background-image here! */
      }
    `;
    document.head.appendChild(style);
    element.setAttribute('data-certificate-preview', 'true');
    try {
      const canvas = await html2canvas(element, { useCORS: true });
      return canvas;
    } finally {
      document.head.removeChild(style);
      element.removeAttribute('data-certificate-preview');
    }
  };

  const handlePreview = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await runHtml2CanvasWithOklchFix(certificateRef.current);
        setPreviewUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error generating preview:', err);
        setMessage('Error generating preview');
      }
    }
  };

  const handleSaveToDatabase = () => {
    setTemplateNameInput(form.name || "");
    setNameError("");
    setShowNameModal(true);
  };

  const handleConfirmSave = async () => {
    if (!templateNameInput.trim()) {
      setNameError("Template name is required");
      return;
    }
    setLoading(true);
    setNameError("");
    setMessage("");
    try {
      const payload = {
        name: templateNameInput.trim(),
        data: form.data
      };
      if (templateId) {
        // Update existing template
        await axios.put(`https://certificat-backend.onrender.com/api/templates/${templateId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForm(prev => ({ ...prev, name: templateNameInput.trim() }));
        setShowNameModal(false);
        setTemplateNameInput("");
        setMessage('Template updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSave) onSave();
      } else {
        // Create new template
        await axios.post('https://certificat-backend.onrender.com/api/templates', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForm(prev => ({ ...prev, name: templateNameInput.trim() }));
        setShowNameModal(false);
        setTemplateNameInput("");
        setMessage('Template created successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSave) onSave();
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('duplicate')) {
        setNameError('Template name must be unique');
      } else if (err.response && err.response.data && err.response.data.message === 'No token') {
        setNameError('You must be logged in to save a template. Please log in again.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setNameError('Error: ' + err.response.data.message);
      } else {
        setNameError('Unknown error saving template');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add update handler for modal
  const handleConfirmUpdate = async () => {
    setLoading(true);
    setNameError("");
    setMessage("");
    try {
      const payload = {
        name: form.name, // keep name unchanged
        data: form.data
      };
      await axios.put(`https://certificat-backend.onrender.com/api/templates/${templateId}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowNameModal(false);
      setMessage('Template updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onSave) onSave();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('duplicate')) {
        setNameError('Template name must be unique');
      } else if (err.response && err.response.data && err.response.data.message === 'No token') {
        setNameError('You must be logged in to update a template. Please log in again.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setNameError('Error: ' + err.response.data.message);
      } else {
        setNameError('Unknown error updating template');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderElement = (el) => {
    if (el.type === 'text') {
      return (
        <ContentEditable
          key={el.id}
          html={el.text}
          disabled={false}
          onChange={evt => {
            const newItems = form.data.items.map(item => item.id === el.id ? { ...item, text: evt.target.value } : item);
            setForm(prev => ({
              ...prev,
              data: { ...prev.data, items: newItems }
            }));
          }}
          style={{ ...el.style, width: '100%', height: '100%' }}
          className={selectedId === el.id ? 'selected p-1' : 'p-1'}
          placeholder={el.placeholder}
          onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
        />
      );
    }
    // fallback for unknown types
    return <div key={el.id}>Unknown element</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-center font-semibold">{message}</div>
      )}
      {/* Top toolbar */}
      <div className="bg-white border-b p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="font-bold text-lg">Professional Certificate Designer</div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            className="px-3 py-1 bg-pink-600 text-white rounded w-full sm:w-auto flex items-center gap-1"
            onClick={handleSaveToDatabase}
          >
            <FaFileUpload size={14} /> {templateId ? 'Update' : 'Save to Database'}
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded w-full sm:w-auto flex items-center gap-1"
            onClick={handlePreview}
            type="button"
          >
            <FaEye size={14} /> Preview
          </button>
        </div>
      </div>
      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded shadow-lg p-4 relative max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold" onClick={() => setPreviewUrl(null)}>&times;</button>
            <img
              src={previewUrl}
              alt="Certificate Preview"
              style={{
                display: 'block',
                maxWidth: '100vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                margin: 0,
                padding: 0,
                border: 'none',
                boxShadow: 'none',
                background: 'none',
              }}
            />
          </div>
        </div>
      )}
      {/* Name Modal for Save to Database */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowNameModal(false)}>
          <div className="bg-white rounded shadow-lg p-6 relative w-full max-w-xs flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold" onClick={() => setShowNameModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-2">{templateId ? 'Update Certificate Template' : 'Save Certificate Template'}</div>
            <label className="text-sm font-medium">Template Name</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={templateNameInput}
              onChange={e => setTemplateNameInput(e.target.value)}
              placeholder="Enter unique template name"
              autoFocus
              disabled={!!templateId} // Disable editing name if updating
            />
            {nameError && <div className="text-red-500 text-xs">{nameError}</div>}
            <button
              className="bg-blue-600 text-white rounded px-4 py-2 mt-2 font-semibold"
              onClick={templateId ? handleConfirmUpdate : handleConfirmSave}
              disabled={loading}
            >
              {loading ? (templateId ? 'Updating...' : 'Saving...') : (templateId ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Main canvas - Certificate Preview on the left */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto flex order-1 md:order-none"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={e => {
            // Only deselect if click is NOT inside any Rnd/textbox
            // If the click target is inside a .certificate-textbox, do nothing
            if (!e.target.closest('.certificate-textbox')) {
              setSelectedId(null);
            }
          }}
        >
          <div 
            ref={certificateRef}
            className="relative"
            style={{
              width: certificateStyle.width || 800,
              height: certificateStyle.height || 600,
              backgroundImage: certificateStyle.backgroundImage ? `url(${certificateStyle.backgroundImage})` : undefined,
              backgroundSize: certificateStyle.backgroundImage ? 'contain' : undefined,
              backgroundPosition: certificateStyle.backgroundImage ? 'center' : undefined,
              backgroundRepeat: certificateStyle.backgroundImage ? 'no-repeat' : undefined,
              backgroundColor: certificateStyle.backgroundColor || certificateStyle.background || '#f9f5e8',
              borderRadius: 8,
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              border: 'none', // Remove border
              overflow: 'hidden',
              padding: 0, // Remove all padding
            }}
          >
            {form.data.items.filter(el => el && el.id).map(el => (
              <Rnd
                key={el.id}
                size={{ width: el.width || 200, height: el.height || 40 }}
                position={{ x: el.x || 0, y: el.y || 0 }}
                onDragStop={(e, d) => handleDragStop(el.id, d)}
                onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(el.id, dir, ref, delta, pos)}
                bounds="parent"
                style={{ zIndex: typeof el.zIndex === 'number' ? el.zIndex : (selectedId === el.id ? 999 : 1), position: 'absolute', overflow: 'visible' }}
                enableResizing={{
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: true,
                  topLeft: true
                }}
                onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
                className="certificate-textbox"
              >
                {/* Delete button at top right corner, always visible when selected */}
                {selectedId === el.id && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                    className="absolute right-0 -top-3 transform-none bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs z-50 shadow border-2 border-white"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    tabIndex={-1}
                  >
                    <MdDelete size={16} />
                  </button>
                )}
                {/* Textbox content */}
                <div style={{ width: '100%', height: '100%' }} onClick={e => e.stopPropagation()}>
                  {renderElement(el)}
                </div>
              </Rnd>
            ))}
          </div>
        </div>
        {/* Sidebar - Certificate Elements and Style on the right */}
        <div className="w-full md:w-56 bg-white border-l p-3 overflow-y-auto flex-shrink-0 order-2 md:order-none">
          <div className="font-bold mb-3 text-sm uppercase text-gray-500">Certificate Elements</div>
          <div className="grid grid-cols-2 gap-2">
            <div
              key="text"
              draggable
              onDragStart={(e) => handleDragStart(e, 'text')}
              onClick={() => addElement('text')}
              className="p-3 border rounded cursor-pointer bg-gray-50 hover:bg-blue-50 flex flex-col items-center gap-1 text-center"
            >
              <span className="text-blue-500"><MdTextFields /></span>
              <span className="text-xs">Text</span>
            </div>
          </div>

          {/* Certificate style controls always at the top */}
          <div className="mt-6">
            <div className="font-bold mb-3 text-sm uppercase text-gray-500">Certificate Style</div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500">Width</label>
                <input
                  type="number"
                  value={form.data.certificateStyle.width ?? 800}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      certificateStyle: {
                        ...prev.data.certificateStyle,
                        width: parseInt(e.target.value)
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded"
                  min="100"
                  max="2000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Height</label>
                <input
                  type="number"
                  value={form.data.certificateStyle.height ?? 600}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      certificateStyle: {
                        ...prev.data.certificateStyle,
                        height: parseInt(e.target.value)
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded"
                  min="100"
                  max="2000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Background Color</label>
                <input
                  type="color"
                  value={form.data.certificateStyle.backgroundColor ?? '#ffffff'}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      certificateStyle: {
                        ...prev.data.certificateStyle,
                        backgroundColor: e.target.value
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImage}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Padding</label>
                <input
                  type="number"
                  value={form.data.certificateStyle.padding ?? 0}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      certificateStyle: {
                        ...prev.data.certificateStyle,
                        padding: parseInt(e.target.value)
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Textbox style controls always below certificate style controls */}
          {selectedId && (() => {
            const idx = form.data.items.findIndex(el => el.id === selectedId);
            const el = form.data.items[idx];
            if (!el) return null;
            return (
              <div className="mt-6 p-3 border rounded bg-gray-50">
                <div className="font-bold mb-2 text-xs uppercase text-gray-500">Textbox Style</div>
                {/* Font Family */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Font Family</label>
                  <select
                    value={el.style.fontFamily || 'Montserrat, sans-serif'}
                    onChange={e => handleStyleChange(idx, 'fontFamily', e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    {FONT_FAMILIES.map(f => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>
                {/* Text Color */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Text Color</label>
                  <input
                    type="color"
                    value={el.style.color || '#222222'}
                    onChange={e => handleStyleChange(idx, 'color', e.target.value)}
                    className="w-full p-1 border rounded cursor-pointer"
                  />
                </div>
                {/* Font Size */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="200"
                    value={el.style.fontSize || 32}
                    onChange={e => handleStyleChange(idx, 'fontSize', parseInt(e.target.value))}
                    className="w-full p-1 border rounded"
                  />
                </div>
                {/* Font Weight */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Font Weight</label>
                  <select
                    value={el.style.fontWeight || 'bold'}
                    onChange={e => handleStyleChange(idx, 'fontWeight', e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                    <option value="bolder">Bolder</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
                {/* Italic, Underline, Shadow, Letter Spacing, Alignment */}
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`p-1 border rounded ${el.style.fontStyle === 'italic' ? 'bg-blue-200' : ''}`}
                    onClick={() => handleStyleChange(idx, 'fontStyle', el.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <FaItalic />
                  </button>
                  <button
                    type="button"
                    className={`p-1 border rounded ${el.style.textDecoration === 'underline' ? 'bg-blue-200' : ''}`}
                    onClick={() => handleStyleChange(idx, 'textDecoration', el.style.textDecoration === 'underline' ? 'none' : 'underline')}
                  >
                    <FaUnderline />
                  </button>
                  <button
                    type="button"
                    className={`p-1 border rounded ${el.style.textAlign === 'left' ? 'bg-blue-200' : ''}`}
                    onClick={() => handleStyleChange(idx, 'textAlign', 'left')}
                  >
                    <FaAlignLeft />
                  </button>
                  <button
                    type="button"
                    className={`p-1 border rounded ${el.style.textAlign === 'center' ? 'bg-blue-200' : ''}`}
                    onClick={() => handleStyleChange(idx, 'textAlign', 'center')}
                  >
                    <FaAlignCenter />
                  </button>
                  <button
                    type="button"
                    className={`p-1 border rounded ${el.style.textAlign === 'right' ? 'bg-blue-200' : ''}`}
                    onClick={() => handleStyleChange(idx, 'textAlign', 'right')}
                  >
                    <FaAlignRight />
                  </button>
                </div>
                {/* Letter Spacing */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Letter Spacing</label>
                  <input
                    type="number"
                    min="-5"
                    max="20"
                    value={el.style.letterSpacing ? parseFloat(el.style.letterSpacing) : 1}
                    onChange={e => handleStyleChange(idx, 'letterSpacing', e.target.value + 'px')}
                    className="w-full p-1 border rounded"
                  />
                </div>
                {/* Text Shadow */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Text Shadow</label>
                  <input
                    type="text"
                    value={el.style.textShadow || ''}
                    onChange={e => handleStyleChange(idx, 'textShadow', e.target.value)}
                    className="w-full p-1 border rounded"
                    placeholder="e.g. 0 2px 8px #00000022"
                  />
                </div>
                {/* Custom ID for dynamic data */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500">Custom ID (for dynamic data)</label>
                  <input
                    type="text"
                    value={el.idAttribute || ''}
                    onChange={e => {
                      const newItems = [...form.data.items];
                      newItems[idx] = { ...newItems[idx], idAttribute: e.target.value };
                      setForm(prev => ({ ...prev, data: { ...prev.data, items: newItems } }));
                    }}
                    className="w-full p-1 border rounded"
                    placeholder="e.g. student_name"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}