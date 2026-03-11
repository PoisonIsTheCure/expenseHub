import { useState, useEffect } from 'react';
import heic2any from 'heic2any';
import { uploadAPI } from '../services/api';

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
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, boolean>>({});

  const previewableImageMimes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]);
  const heicMimes = new Set([
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
  ]);

  const getFilename = (url: string) => (url.startsWith('/') ? url.substring(1) : url);
  const isHeicAttachment = (attachment: Attachment) =>
    heicMimes.has(attachment.mimetype.toLowerCase()) ||
    /\.(heic|heif)$/i.test(attachment.originalName || attachment.filename);

  const getPreviewBlob = async (attachment: Attachment, blob: Blob): Promise<Blob> => {
    if (!isHeicAttachment(attachment)) {
      return blob;
    }

    const converted = await heic2any({
      blob,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    if (Array.isArray(converted)) {
      return converted[0] as Blob;
    }

    return converted as Blob;
  };

  // Load attachment URLs when component opens
  useEffect(() => {
    if (isOpen && attachments.length > 0) {
      setCurrentIndex(initialIndex);

      attachments.forEach(async (attachment) => {
        const filename = getFilename(attachment.url);
        if (!attachmentUrls[filename]) {
          setLoading(prev => ({ ...prev, [filename]: true }));
          try {
            const response = await uploadAPI.getAttachment(filename);
            const blob = await getPreviewBlob(attachment, response.data);
            const url = URL.createObjectURL(blob);
            setAttachmentUrls(prev => ({ ...prev, [filename]: url }));
          } catch (error) {
            console.error('Error loading attachment:', error);
            setPreviewErrors(prev => ({ ...prev, [filename]: true }));
          } finally {
            setLoading(prev => ({ ...prev, [filename]: false }));
          }
        }
      });
    }
  }, [isOpen, attachments, initialIndex]);

  // Prevent page scroll while modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(attachmentUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [attachmentUrls]);

  if (!isOpen || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];
  const isImage = currentAttachment.mimetype.startsWith('image/');
  const isPreviewableImage = previewableImageMimes.has(currentAttachment.mimetype.toLowerCase());
  const isHeic = isHeicAttachment(currentAttachment);
  const isPDF = currentAttachment.mimetype === 'application/pdf';

  // Helper function to get the blob URL for display
  const getFileUrl = (url: string) => {
    const filename = getFilename(url);
    return attachmentUrls[filename] || '';
  };

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

  const downloadFile = async () => {
    const filename = getFilename(currentAttachment.url);
    try {
      await uploadAPI.downloadAttachment(filename, currentAttachment.originalName);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
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
        <div className="flex-1 min-h-0 p-4 overflow-hidden">
          {(() => {
            const filename = getFilename(currentAttachment.url);
            const isLoading = loading[filename];
            const blobUrl = attachmentUrls[filename];
            const hasPreviewError = previewErrors[filename];

            if (isLoading) {
              return (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading attachment...</p>
                </div>
              );
            }

            if (hasPreviewError) {
              return (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Could not preview this attachment.</p>
                  <button
                    onClick={downloadFile}
                    className="btn btn-primary"
                  >
                    Download File
                  </button>
                </div>
              );
            }

            if (isImage && (isPreviewableImage || isHeic)) {
              return blobUrl ? (
                <div className="mx-auto w-full max-w-3xl h-full max-h-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <img
                    src={blobUrl}
                    alt={currentAttachment.originalName}
                    className="block w-full h-auto rounded-md shadow-lg"
                    onError={() => setPreviewErrors(prev => ({ ...prev, [filename]: true }))}
                  />
                </div>
              ) : (
                <p className="text-gray-600">Image preview not available</p>
              );
            } else if (isPDF) {
              return blobUrl ? (
                <iframe
                  src={blobUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={currentAttachment.originalName}
                  onError={() => setPreviewErrors(prev => ({ ...prev, [filename]: true }))}
                />
              ) : (
                <p className="text-gray-600">PDF preview not available</p>
              );
            } else {
              return (
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
              );
            }
          })()}
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
                      src={attachmentUrls[attachment.url.startsWith('/') ? attachment.url.substring(1) : attachment.url] || getFileUrl(attachment.url)}
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
