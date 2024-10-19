'use client';
import React, { useCallback, useState, useRef } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

type PDFFile = File | null;

export default function PDFViewer() {
  const [file, setFile] = useState<PDFFile>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 565 }); // 默认尺寸
  const [zoomCount, setZoomCount] = useState(0);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef.current, resizeObserverOptions, onResize);

  React.useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(onResize);
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [onResize]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;
    if (files && files[0]) {
      setFile(files[0]);
      setPageNumber(1);
      setRotation(0);
    }
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      setFile(files[0]);
      setPageNumber(1);
      setRotation(0);
    }
  };

  const rotateRight = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const rotateAll = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const removePDF = () => {
    setFile(null);
    setRotation(0);
    setPageNumber(1);
    setZoomCount(0);
    setScale(1);
    setDragOffset({ x: 0, y: 0 });
  };

  const downloadRotatedPDF = async () => {
    if (!file) return;

    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      page.setRotation(degrees(rotation));
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rotated_${file.name}`;
    link.click();
  };

  const handlePageLoadSuccess = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      const aspectRatio = width / height;
      const newWidth = Math.min(containerWidth || 400, 400);
      const newHeight = newWidth / aspectRatio;
      setPageWidth(newWidth);
      setContainerSize({ width: newWidth, height: newHeight });
    },
    [containerWidth]
  );

  const updateContainerSize = useCallback(() => {
    if (pageWidth) {
      let newWidth = pageWidth * scale;
      let newHeight = pageWidth * 1.414 * scale; // 假设是A4纸比例

      // 如果旋转了90度或270度，交换宽高
      if (rotation % 180 !== 0) {
        [newWidth, newHeight] = [newHeight, newWidth];
      }

      setContainerSize({ width: newWidth, height: newHeight });
    }
  }, [pageWidth, scale, rotation]);

  // 在scale或rotation变化时更新容器大小
  React.useEffect(() => {
    updateContainerSize();
  }, [scale, rotation, updateContainerSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragOffset({ x: dragOffset.x + dx, y: dragOffset.y + dy });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomOut = () => {
    if (zoomCount > -3) {
      setScale((s) => Math.max(s - 0.1, 0.5));
      setZoomCount((prev) => prev - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoomCount < 3) {
      setScale((s) => Math.min(s + 0.1, 2));
      setZoomCount((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-[#f7f5ee] text-black">
      <div className="container mx-auto py-20 space-y-5">
        <div className="flex flex-col text-center !mb-10 space-y-5">
          <h1 className="text-5xl font-serif">Rotate PDF Pages</h1>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">
            Simply click on a page to rotate it. You can then download your modified PDF.
          </p>
        </div>

        {!file && (
          <div className="w-full flex justify-center">
            <div className="h-[350px] relative text-center w-[275px]">
              <input
                id="input-file-upload"
                name="file-upload"
                type="file"
                className="cursor-pointer hidden"
                accept=".pdf"
                onChange={onFileChange}
              />
              <label
                htmlFor="input-file-upload"
                className="h-full flex items-center justify-center border rounded transition-all bg-white border-dashed border-stone-300"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="cursor-pointer flex flex-col items-center space-y-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                  <p className="pointer-events-none font-medium text-sm leading-6 opacity-75">
                    Click to upload or drag and drop
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {file && (
          <>
            <div className="flex justify-center items-center space-x-3 selecto-ignore">
              <Button onClick={rotateAll} className="bg-[#ff612f] text-white hover:bg-[#ff7b4f]">
                Rotate all
              </Button>
              <Button onClick={removePDF} className="bg-[#1e293b] text-white hover:bg-[#334155]">
                Remove PDF
              </Button>
              <Button
                onClick={handleZoomOut}
                className="bg-white text-black hover:bg-gray-100 border border-gray-300"
                disabled={zoomCount <= -3}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleZoomIn}
                className="bg-white text-black hover:bg-gray-100 border border-gray-300"
                disabled={zoomCount >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>

            <div
              className="flex justify-center items-center overflow-hidden mx-auto "
              ref={containerRef}
              style={{
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
                maxWidth: '100%',
                position: 'relative',
              }}
            >
              <div
                className="absolute cursor-pointer"
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                  transformOrigin: 'center center',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={rotateRight}
              >
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    scale={scale}
                    rotate={rotation}
                    onLoadSuccess={handlePageLoadSuccess}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </div>

            <div className="w-full text-center shrink-0 text-xs italic overflow-hidden text-ellipsis whitespace-nowrap mt-2">
              Page {pageNumber} of {numPages}
            </div>

            <div className="flex justify-center mt-4">
              <Button onClick={downloadRotatedPDF} className="bg-[#ff612f] text-white hover:bg-[#ff7b4f] shadow">
                Download
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
