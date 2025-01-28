import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CrossIcon, PenSquare, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { commonRequest, URL as BACKEND } from '../../common/api';
import { config } from '../../common/configurations';
import ISO6391 from 'iso-639-1';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { uploadEditedLessonTos3 } from '../../common/s3';

const languages = ISO6391.getAllNames();

interface Category {
  _id: string;
  name: string;
}

const EditCoursePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const location = useLocation();
  const course = location.state?.course
  const [courseData, setCourseData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [removeFromS3,setRemoveFromS3] = useState<any>([]);

  
  useEffect(() => {
    if (course) {
      setCourseData(course);
    }
  }, [course]);

  const fetchCategory = async () => {
    try {
      const res = await commonRequest(
        'GET',
        `${BACKEND}/course/get-category-status-true`,
        {},
        config
      );
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!courseData) {
        toast.error('Course data not loaded');
        return;
      }
  
      // Basic validations
      if (!courseData.basicDetails.title.trim()) {
        toast.error('Course title is required');
        return;
      }
  
      if (!courseData.basicDetails.description.trim()) {
        toast.error('Course description is required');
        return;
      }
  
      if (courseData.basicDetails.description.trim().length < 200) {
        toast.error('Description must be at least 200 characters');
        return;
      }
  
      if (!courseData.basicDetails.category) {
        toast.error('Please select a category');
        return;
      }
  
      if (!courseData.basicDetails.language) {
        toast.error('Please select a language');
        return;
      }
  
      // Learning points validation
      const learningPoints = courseData.basicDetails.whatWillLearn || [];
      if (learningPoints.length < 2) {
        toast.error('At least two learning point is required');
        return;
      }
  
      if (learningPoints.some((point:string) => !point.trim())) {
        toast.error('Learning points cannot be empty');
        return;
      }
  
      // Lessons validation
      const lessons = courseData.courseContent.lessons || [];
      if (lessons.length < 2) {
        toast.error('At least two lesson is required');
        return;
      }
  
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson.title.trim()) {
          toast.error(`Lesson ${i + 1}: Title is required`);
          return;
        }
        if (!lesson.description.trim()) {
          toast.error(`Lesson ${i + 1}: Description is required`);
          return;
        }
        if (!lesson.videoUrl && !lesson.videoPreview?.url) {
          toast.error(`Lesson ${i + 1}: Video is required`);
          return;
        }
      }

      if (courseData.pricing.type === "paid") {
        if (courseData.pricing.amount === "" || courseData.pricing.amount <= 0) {
          toast.error("Price should be greater than 0.");
          return;
        }
      }
      
  
      // Proceed with update if all validations pass
      const currentDate = new Date().toISOString();
      const updateData = {
        ...courseData,
        metadata: {
          ...courseData.metadata,
          updatedAt: currentDate,
          updatedBy: user?.email || ""
        },
      };

      const s3Uploaded = await uploadEditedLessonTos3(updateData);
  
      // const response = await commonRequest(
      //   'PUT',
      //   `${BACKEND}/course/update-course/${courseData._id}`,
      //   updateData,
      //   config
      // );
  
      // if (!response.success) {
      //   toast.error('Failed to update course. Please try again!');
      //   return;
      // }
      console.log(updateData)
  
      toast.success("finished!!!!");
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error.message || 'An error occurred while updating the course');
    }
  };

  const handleLearningPointChange = (index: number, newLearningPoint: string) => {
    const updatedLearningPoints = [...(courseData?.basicDetails?.whatWillLearn || [])];
    updatedLearningPoints[index] = newLearningPoint;
    
    setCourseData({
        ...courseData,
        basicDetails: {
          ...courseData.basicDetails,
          whatWillLearn: updatedLearningPoints,
          
        },
    })
  };
  

  const handleAddLearningPoint = () => {
    const updatedLearningPoints = [...(courseData?.basicDetails?.whatWillLearn || []), ''];
    setCourseData({
      ...courseData!,
      basicDetails: {
        ...courseData.basicDetails,
        whatWillLearn: updatedLearningPoints,
      },
    });
  };
  
  const handleDeleteLearningPoint = (index: number) => {
    const updatedLearningPoints = [...(courseData?.basicDetails?.whatWillLearn || [])];
    updatedLearningPoints.splice(index, 1);
    setCourseData({
      ...courseData!,
      basicDetails: {
        ...courseData.basicDetails,
        whatWillLearn: updatedLearningPoints,
      },
    });
  };
  

  const handleCategoryChange = (e:any) => {
      setCourseData({
        ...courseData,
        basicDetails: {
          ...courseData.basicDetails,
          category: e.target.value,
          
        },
      })
  }

  const handleDeleteLesson = (index: number) => {
    const updatedLessons = [...(courseData?.courseContent?.lessons || [])];
    const [{videoUrl}] = updatedLessons.splice(index, 1);

    if(!(videoUrl instanceof File)){
      setRemoveFromS3((prev:any) => [...prev,videoUrl])
    }
    
    setCourseData({
      ...courseData,
      courseContent: {
        ...courseData.courseContent,
        lessons: updatedLessons,
      },
    });
  };


  const handleUpdateLesson = (index:number, field:any, value:any) => {
    setCourseData((prevData:any) => {
      const updatedLessons = [...prevData.courseContent.lessons];
      updatedLessons[index] = {
        ...updatedLessons[index],
        [field]: value,
      };
      return {
        ...prevData,
        courseContent: {
          ...prevData.courseContent,
          lessons: updatedLessons,
        },
      };
    });
  };

  const handleVideoUpload = async (index: number, file: File) => {
    try {
      if (!(file instanceof File)) {
        toast.error("Please upload a valid video file.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error("Please upload a valid video file.");
        return;
      }

      const videoPreview = await URL.createObjectURL(file);
      const videoElement = document.createElement("video");
      
      // Create a promise to handle the metadata loading
      const getVideoDuration = new Promise<string>((resolve, reject) => {
        videoElement.src = videoPreview;
        
        videoElement.onloadedmetadata = () => {
          const durationInSeconds = videoElement.duration;
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = Math.floor(durationInSeconds % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          resolve(formattedDuration);
        };

        videoElement.onerror = () => {
          reject(new Error("Error loading video metadata"));
        };
      });

      const formattedDuration = await getVideoDuration;

      const updatedLessons = [...courseData.courseContent.lessons];

      updatedLessons[index] = await {
        ...updatedLessons[index],
        videoUrl: file,
        videoPreview: {
          url: videoPreview,
          duration: formattedDuration
        },
        duration: formattedDuration,
      };
      console.log(updatedLessons[index])
      setCourseData({
        ...courseData,
        courseContent: {
          ...courseData.courseContent,
          lessons: updatedLessons,
        },
      });

      toast.success("Video preview and details set successfully!");
    } catch (error) {
      console.error("Error during video upload:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while processing the video.");
    }
  };

  const handleRemoveVideo = async (index: number) => {
    try {
      const updatedLessons = [...courseData.courseContent.lessons];
      const { videoPreview, ...restLesson } = updatedLessons[index];

      if(!(restLesson.videoUrl instanceof File)){
        setRemoveFromS3((prev:any) => [...prev,restLesson.videoUrl])
      }
  
      updatedLessons[index] = await {
        ...restLesson,
        videoUrl: null,
        duration: null,
      };
      console.log(updatedLessons);
      setCourseData({
        ...courseData,
        courseContent: {
          ...courseData.courseContent,
          lessons: updatedLessons,
        },
      });
    } catch (error) {
      console.error(error, "error in handle remove video");
    }
  };
  const handleThumbnailRemove = () => {
    try {
      if(!(courseData.basicDetails.thumbnail instanceof File)){
        const thumbnail = courseData.basicDetails.thumbnail;
        setRemoveFromS3((prev:any) => [...prev, thumbnail])
      }

      setCourseData((prevData: any) => ({
        ...prevData,
        basicDetails: {
          ...prevData.basicDetails,
          thumbnail: null,
          thumbnailPreview: null,
        },
      }))
    } catch (error) {
      
    }
  }
  
  const handleThumbnailUpload = (file:File) => {
    try {
      if(file && file instanceof File){
        if (!file.type.startsWith('image/')) {
          toast.error("Please upload a valid image file.");
          return;
        }

        const thumbnailPreview = URL.createObjectURL(file);

        setCourseData((prevData:any) => ({
          ...prevData,
          basicDetails: {
            ...prevData.basicDetails,
            thumbnail: file,
            thumbnailPreview,
          },
        }))
        toast.success("image uploaded")
      }else{
        toast.error("please upload a valid image")
      }
    } catch (error) {
      console.error(error, "error in handle remove thumbnail");
    }
  }
  
  const handleAddLesson = () => {
    const newLesson = {
      title: '',
      description: '',
      duration: '',
      videoUrl: '',
      isIntroduction: false,
      videoPreview: { url: '', duration: '' },
    };

    setCourseData({
      ...courseData!,
      courseContent: {
        ...courseData.courseContent,
        lessons: [...courseData.courseContent.lessons, newLesson],
      },
    });
  };

  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const result = e.target.value;
  
      if (courseData.pricing.type !== result) {
        setCourseData((prev:any) => ({
          ...prev,
          pricing: {
            ...prev.pricing, 
            type: result,
            amount: 0

          },
        }));
      }
    } catch (error) {
      toast.error("Error in price change");
    }
  };
  

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const amount = e.target.value;
      
      // Check for empty value (if the user clears the input)
      if (amount === '') {
        setCourseData((prev:any) => ({
          ...prev,
          pricing: {
            ...prev.pricing,
            amount: '', // Set to empty if cleared
          },
        }));
      } else {
        const parsedAmount = parseFloat(amount); // Convert to number
    
        if (!isNaN(parsedAmount)) {
          setCourseData((prev:any) => ({
            ...prev,
            pricing: {
              ...prev.pricing,
              amount: parsedAmount, // Allow negative or positive values
            },
          }));
        } else {
          toast.error("Please enter a valid amount");
        }
      }
    } catch (error) {
      toast.error("Error in amount change");
    }
  };
  

  if (!courseData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PenSquare className="w-8 h-8" />
            Edit Course
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Basic Details</h2>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 mb-5">
              <label className="block text-sm font-medium text-gray-700">
                  Thumbnail
              </label>
              {courseData?.basicDetails?.thumbnailPreview || courseData?.basicDetails?.thumbnail ? (
                <div
                  className={`flex items-center ${
                    courseData?.basicDetails?.thumbnailPreview ? "border-2 border-orange-500 p-2 rounded-md" : ""
                  }`}
                >
                  <img
                    src={
                      courseData?.basicDetails?.thumbnailPreview ||
                      courseData?.basicDetails?.thumbnail
                    }
                    alt="course thumbnail"
                    className="w-[120px] h-[120px] rounded-md object-cover"
                  />
                  <button
                    className="ml-4 text-red-600 hover:text-red-700"
                    onClick={() => handleThumbnailRemove()}
                  >
                    Remove Thumbnail
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleThumbnailUpload(e.target.files[0])
                  }
                  className="mt-2 block w-full text-sm text-gray-700 border border-gray-300 rounded-md"
                />
              )}
            </div>

            {/* Title */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseData.basicDetails.title}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      basicDetails: {
                        ...courseData.basicDetails,
                        title: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter course title"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  value={courseData.basicDetails.language}
                  onChange={(e) =>
                    setCourseData({
                        ...courseData,
                        basicDetails: {
                            ...courseData.basicDetails,
                            language: e.target.value,
                          },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select language</option>
                  {languages.map((language) => (
                    <option key={language} value={ISO6391.getCode(language)}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  minLength={200}
                  value={courseData.basicDetails.description}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      basicDetails: {
                        ...courseData.basicDetails,
                        description: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Describe your course (minimum 100 characters)"
                  rows={4}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={courseData.basicDetails.category._id}
                  onChange={(e) =>
                    handleCategoryChange(e)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category: Category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Points */}
            <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-2">
                What Will Students Learn?
            </label>
            {courseData.basicDetails?.whatWillLearn?.map((point: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                <input
                    type="text"
                    value={point}
                    onChange={(e) => handleLearningPointChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Learning point ${index + 1}`}
                />
                <button
                    type="button"
                    onClick={() => handleDeleteLearningPoint(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => handleAddLearningPoint()}
                className="flex items-center text-indigo-600 hover:text-indigo-700"
            >
                <Plus className="w-5 h-5 mr-1" />
                Add Learning Point
            </button>


            </div>
             {/* Lessons List */}
            <h2 className="text-2xl font-bold ">Course Content</h2>
             <div className="mt-6 w-full">
                <h3 className="text-lg font-bold mb-4">Lessons</h3>
                {courseData.courseContent?.lessons?.length > 0 ? (
                  <ul className="space-y-4">
                    {courseData.courseContent.lessons.map((lesson: any, index: number) => (
                      <li
                        key={index}
                        className="flex flex-col bg-gray-100 p-4 rounded-md shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-start gap-6 w-2/3">
                            {/* Lesson Info */}
                            <div>
                              <label className="text-sm font-semibold block">Title:</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) =>
                                  handleUpdateLesson(index, "title", e.target.value)
                                }
                                className="text-gray-700 font-semibold border border-gray-300 rounded-md p-2 w-full"
                              />
                            </div>
                            <div className="w-full">
                              <label className="text-sm font-semibold block">
                                Description:
                              </label>
                              <textarea
                                value={lesson.description}
                                onChange={(e) =>
                                  handleUpdateLesson(index, "description", e.target.value)
                                }
                                className="text-gray-700 border border-gray-300 rounded-md p-2 w-full max-w-2xl"
                                rows={3}
                              />
                            </div>
                          </div>
                          {/* Video Upload */}
                          <div className="flex flex-col items-start gap-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Upload Video
                            </label>
                            {lesson?.videoPreview?.url ? (
                              <>
                                <div className="border-2 border-orange-500 p-2 rounded-md">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Current Video (Preview)
                                  </label>
                                  <video
                                    controls
                                    className="rounded-md mt-2"
                                    style={{ maxWidth: "400px", maxHeight: "300px" }}
                                  >
                                    <source src={lesson?.videoPreview?.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(index)}
                                  className="text-orange-500 hover:text-red-700 mt-2"
                                >
                                  Remove Preview
                                </button>
                              </>
                            ) : lesson?.videoUrl ? (
                              <>
                                <div className="p-2 rounded-md">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Current Video
                                  </label>
                                  <video
                                    controls
                                    className="rounded-md mt-2"
                                    style={{ maxWidth: "400px", maxHeight: "300px" }}
                                  >
                                    <source src={lesson?.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(index)}
                                  className="text-red-500 hover:text-red-700 mt-2"
                                >
                                 Remove Video
                                </button>
                              </>
                            ) : (
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                  e.target.files && handleVideoUpload(index, e.target.files[0])
                                }
                                className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md"
                              />
                            )}

                          </div>
                          {/* Delete Button */}
                          <div className='flex flex-col items-start gap-2 '>
                              <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(index)}
                                  className="text-red-500 hover:text-red-700 ml-4"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No lessons added yet.</p>
                )}

                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="flex items-center text-indigo-600 hover:text-indigo-700 mt-4"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add New Lesson
                </button>
              </div>

              <div className="mt-6">
              <h2 className="text-2xl font-bold">Pricing Details</h2>
          
              {/* Radio buttons for pricing type */}
              <div className="flex items-center gap-4 mt-4">
                <div>
                  <input
                    type="radio"
                    id="free"
                    name="pricingType"
                    value="free"
                    checked={courseData?.pricing?.type === 'free'}
                    onChange={(e) => handlePricingChange(e)}
                    className="mr-2"
                  />
                  <label htmlFor="free" className="text-gray-700">Free</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="paid"
                    name="pricingType"
                    value="paid"
                    checked={courseData.pricing?.type === 'paid'}
                    onChange={(e) => handlePricingChange(e)}
                    className="mr-2"
                  />
                  <label htmlFor="paid" className="text-gray-700">Paid</label>
                </div>
              </div>

              {/* Amount field appears only if the course is paid */}
              {courseData.pricing.type === 'paid' && (
                <div className="mt-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={courseData.pricing.amount || ''}
                    onChange={(e) => handleAmountChange(e)}
                    className="mt-1 text-sm text-gray-700 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>

                


              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Update Course
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;
