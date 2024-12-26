// import React, { useState, useRef } from 'react';
// import { Upload, FileText, Trash2 } from 'lucide-react';

// interface CVUploadProps {
//   value?: string;
//   onChange: (file: File | null) => void;
//   disabled?: boolean;
// }

// export const CVUpload: React.FC<CVUploadProps> = ({ 
//   value, 
//   onChange, 
//   disabled = false 
// }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [fileName, setFileName] = useState<string | null>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       // Validate file type and size
//       const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       const maxSize = 5 * 1024 * 1024; // 5MB

//       if (!allowedTypes.includes(file.type)) {
//         alert('Please upload a PDF or Word document.');
//         return;
//       }

//       if (file.size > maxSize) {
//         alert('File size should be less than 5MB.');
//         return;
//       }

//       setFileName(file.name);
//       onChange(file);
//     }
//   };

//   const handleRemoveFile = () => {
//     setFileName(null);
//     onChange(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
//   };

//   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     event.stopPropagation();
    
//     const file = event.dataTransfer.files?.[0];
//     if (file) {
//       const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       const maxSize = 5 * 1024 * 1024; // 5MB

//       if (!allowedTypes.includes(file.type)) {
//         alert('Please upload a PDF or Word document.');
//         return;
//       }

//       if (file.size > maxSize) {
//         alert('File size should be less than 5MB.');
//         return;
//       }

//       setFileName(file.name);
//       onChange(file);
//     }
//   };

//   if (fileName) {
//     return (
//       <div className="relative flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
//         <FileText className="h-8 w-8 text-fuchsia-500 mr-3" />
//         <div className="flex-1 min-w-0 mr-4">
//           <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
//           <p className="text-xs text-gray-500">
//             {fileName.split('.').pop()?.toUpperCase() || 'Document'} file
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={handleRemoveFile}
//           disabled={disabled}
//           className="ml-2 bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Trash2 className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div 
//       onClick={() => !disabled && fileInputRef.current?.click()}
//       onDragOver={handleDragOver}
//       onDrop={handleDrop}
//       className={`
//         border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
//         ${disabled 
//           ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
//           : 'bg-gray-50 border-fuchsia-300 hover:border-fuchsia-500 hover:bg-gray-100'
//         }
//       `}
//     >
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         accept=".pdf,.doc,.docx"
//         className="hidden"
//         disabled={disabled}
//       />
//       <Upload className={`mx-auto mb-4 h-10 w-10 ${disabled ? 'text-gray-400' : 'text-fuchsia-500'}`} />
//       <p className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
//         {disabled 
//           ? 'File upload is disabled' 
//           : 'Drag and drop or click to upload CV (PDF/DOC, max 5MB)'
//         }
//       </p>
//     </div>
//   );
// };