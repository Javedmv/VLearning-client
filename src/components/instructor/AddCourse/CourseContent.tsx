import React from 'react';
import { Formik, Form, Field, FieldArray, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2, Upload } from 'lucide-react';

interface Lesson {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  isIntroduction: boolean;
}

interface CourseContents {
  lessons: Lesson[];
}

interface CourseContentProps {
  onSubmit: (values: CourseContents) => void;
  onBack: () => void;
  onNext: () => void;
  initialValues?: CourseContents;
}

const CourseContentSchema = Yup.object().shape({
  lessons: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        duration: Yup.string().required('Video is required'),
        videoUrl: Yup.string(),
        isIntroduction: Yup.boolean(),
      })
    )
    .min(1, 'At least one lesson is required'),
});

const CourseContent: React.FC<CourseContentProps> = ({
  onSubmit,
  onBack,
  onNext,
  initialValues,
}) => {
  const [videoPreviews, setVideoPreviews] = React.useState<Record<number, { url: string; duration: string }>>({});
  const formikRef = React.useRef<any>(null);

  const handleVideoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        setVideoPreviews((prev) => ({
          ...prev,
          [index]: { url: videoUrl, duration: durationStr },
        }));

        setFieldValue(`lessons.${index}.videoUrl`, videoUrl);
        setFieldValue(`lessons.${index}.duration`, durationStr);
      };
    }
  };

  const handleNext = async () => {
    if (formikRef.current) {
      const isValid = await formikRef.current.validateForm();
      if (Object.keys(isValid).length === 0) {
        onSubmit(formikRef.current.values);
        onNext();
      } else {
        formikRef.current.setTouched(true);
      }
    }
  };

  const defaultInitialValues: CourseContents = {
    lessons: [
      {
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        isIntroduction: true,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Course Content</h2>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues as CourseContents}
        validationSchema={CourseContentSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, setFieldValue }: {
          values: CourseContents;
          errors: FormikErrors<CourseContents>;
          touched: FormikTouched<CourseContents>;
          setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
        }) => (
          <Form>
            <FieldArray name="lessons">
              {({ push, remove }) => (
                <div>
                  {values.lessons && values.lessons.length > 0 ? (
                    values.lessons.map((lesson, index) => (
                      <div key={index} className="mb-8 p-6 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            {index === 0 ? 'Introduction' : `Lesson ${index + 1}`}
                          </h3>
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <Field
                              name={`lessons.${index}.title`}
                              className="w-full p-2 border rounded-md"
                              placeholder="Enter lesson title"
                            />
                            {Array.isArray(errors.lessons) &&
                              errors.lessons[index] && // Check if the error for the current lesson exists
                              touched.lessons?.[index]?.title && (
                                <div className="text-red-500 text-sm mt-1">
                                  {(errors.lessons[index] as FormikErrors<Lesson>).title}
                                </div>
                              )
                            }
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <Field
                              as="textarea"
                              name={`lessons.${index}.description`}
                              className="w-full p-2 border rounded-md"
                              rows={3}
                              placeholder="Enter lesson description"
                            />
                            
                            {Array.isArray(errors.lessons) &&
                              errors.lessons[index] && 
                              touched.lessons?.[index]?.description && (
                                <div className="text-red-500 text-sm mt-1">
                                  {(errors.lessons[index] as FormikErrors<Lesson>).description}
                                </div>
                              )
                            }

                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Video
                            </label>
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center px-4 py-2 bg-white border rounded-md cursor-pointer hover:bg-gray-50">
                                <Upload className="w-5 h-5 mr-2" />
                                <span>Upload Video</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => handleVideoChange(e, index, setFieldValue)}
                                />
                              </label>
                              {videoPreviews[index] && (
                                <span className="text-sm text-gray-500">
                                  Duration: {videoPreviews[index].duration}
                                </span>
                              )}
                            </div>
                            {videoPreviews[index] && (
                              <video
                                className="mt-4 rounded-lg max-w-full"
                                src={videoPreviews[index].url}
                                controls
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No lessons available</div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      push({
                        title: '',
                        description: '',
                        duration: '',
                        videoUrl: '',
                        isIntroduction: false,
                      });
                    }}
                    className="flex items-center px-4 py-2 bg-fuchsia-100 text-fuchsia-700 rounded-md hover:bg-fuchsia-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Lesson
                  </button>
                </div>
              )}
            </FieldArray>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CourseContent;
