import { useState } from 'react';

interface Attachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

interface AttachmentViewerProps {
  attachments: Attachment[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const AttachmentViewer = ({ attachments, isOpen, onClose, initialIndex = 0 }: AttachmentViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];
  const isImage = currentAttachment.mimetype.startsWith('image/');
  const isPDF = currentAttachment.mimetype === 'application/pdf';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${currentAttachment.url}`;
    link.download = currentAttachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentAttachment.originalName}
            </h3>
            <span className="text-sm text-gray-500">
              {formatFileSize(currentAttachment.size)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {attachments.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Previous attachment"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {attachments.length}
                </span>
                <button
                  onClick={goToNext}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Next attachment"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            <button
              onClick={downloadFile}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Download file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close viewer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {isImage ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentAttachment.url}`}
              alt={currentAttachment.originalName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : isPDF ? (
            <iframe
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentAttachment.url}`}
              className="w-full h-full border-0 rounded-lg"
              title={currentAttachment.originalName}
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <button
                onClick={downloadFile}
                className="btn btn-primary"
              >
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail strip for multiple files */}
        {attachments.length > 1 && (
          <div className="border-t p-4">
            <div className="flex gap-2 overflow-x-auto">
              {attachments.map((attachment, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentIndex ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {attachment.mimetype.startsWith('image/') ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${attachment.url}`}
                      alt={attachment.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentViewer;
