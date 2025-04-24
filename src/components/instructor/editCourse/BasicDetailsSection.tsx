import React from 'react';
import ISO6391 from 'iso-639-1';
import { Category } from '../../../pages/instructor/EditCoursePage';
import toast from 'react-hot-toast';
import { TOBE } from '../../../common/constants';

interface BasicDetailsProps {
  courseData: TOBE;
  categories: Category[];
  setCourseData: (data: TOBE) => void;
  onRemoveThumbnail: () => void;
}

export const BasicDetailsSection = ({
  courseData,
  categories,
  setCourseData,
  onRemoveThumbnail
}: BasicDetailsProps) => {

    const languages = ISO6391.getAllNames();

    const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setCourseData({
                ...courseData,
                basicDetails: { ...courseData.basicDetails, title: e.target.value }
              })
        } catch (error) {
            console.log("ERROR IN HANDLE TITLE INPUT:",error)
        }
    }

    const handleThumbnailInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
    
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }
    
            // Create thumbnail preview
            const thumbnailPreview = URL.createObjectURL(file);
    
            // Update course data state
            setCourseData((prev:TOBE) => ({
                ...prev,
                basicDetails: {
                  ...prev.basicDetails,
                  thumbnail: file,
                  thumbnailPreview: thumbnailPreview
                }
            }));
              
            // Cleanup object URL when component unmounts or file changes
            return () => URL.revokeObjectURL(thumbnailPreview);
    
        } catch (error) {
            console.error("Error handling thumbnail input:", error);
            toast.error('Failed to upload thumbnail');
        }
    };

    return (
        <div className="space-y-5 ">
            <h2 className="text-2xl font-bold mb-4">Basic Details</h2>
            
            {/* Thumbnail Upload */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            {courseData?.basicDetails?.thumbnailPreview || courseData?.basicDetails?.thumbnail ? (
                <div className={`p-2 rounded-md ${courseData?.basicDetails?.thumbnailPreview ? "border-2 border-orange-500" : ""}`}>
                <img
                    src={courseData.basicDetails.thumbnailPreview || courseData.basicDetails.thumbnail as string}
                    className="w-32 h-32 rounded-md object-cover"
                />
                <button
                    type="button"
                    onClick={() => onRemoveThumbnail()}
                    className="mt-2 text-red-600 hover:text-red-700"
                >
                    Remove Thumbnail
                </button>
                </div>
            ) : (
                <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailInput(e)}
                className="mt-1 block w-full text-sm text-gray-700"
                />
            )}
            </div>

            {/* Title Input */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Course Title</label>
            <input
                value={courseData.basicDetails.title}
                onChange={(e) => handleTitleInput(e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            </div>

            {/* Language Select */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
                value={courseData?.basicDetails?.language}
                onChange={(e) => setCourseData({
                ...courseData,
                basicDetails: { ...courseData.basicDetails, language: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
                <option value="">Select language</option>
                    {languages.map((language:string) => (
                        <option key={language} value={ISO6391.getCode(language)}>
                            {language}
                        </option>
                    ))}
            </select>
            </div>

            {/* Category Select */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
                value={courseData.basicDetails.category._id}
                onChange={(e) => setCourseData({
                ...courseData,
                basicDetails: { ...courseData.basicDetails, category: e.target.value! }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
                {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
                ))}
            </select>
            </div>

            {/* Description Textarea */}
            <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
                value={courseData.basicDetails.description}
                onChange={(e) => setCourseData({
                ...courseData,
                basicDetails: { ...courseData.basicDetails, description: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-32"
            />
            </div>
        </div>
    )};